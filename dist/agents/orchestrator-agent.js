"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorAgent = void 0;
const uuid_1 = require("uuid");
const ndjson_emitter_1 = require("../logger/ndjson-emitter");
const permissions_config_1 = require("../config/permissions.config");
const agent_sdk_runner_1 = require("./agent-sdk-runner");
const explorer_agent_1 = require("./explorer-agent");
const implementer_agent_1 = require("./implementer-agent");
const reviewer_agent_1 = require("./reviewer-agent");
class OrchestratorAgent {
    constructor(runId, repoFullName, prompt, usageAccumulator) {
        this.runId = runId;
        this.repoFullName = repoFullName;
        this.prompt = prompt;
        this.usageAccumulator = usageAccumulator;
    }
    async plan() {
        (0, ndjson_emitter_1.log)('Planning tasks...');
        const model = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'us.anthropic.claude-sonnet-4-6';
        (0, ndjson_emitter_1.log)(this.prompt);
        const result = await (0, agent_sdk_runner_1.runWithAgentSdk)(`Repository: ${this.repoFullName}\n\nFeature to implement:\n${this.prompt}`, {
            runId: this.runId,
            taskId: 'plan',
            role: 'orchestrator',
            model,
            systemPrompt: permissions_config_1.ORCHESTRATOR_SYSTEM_PROMPT,
            allowedTools: [],
            disallowedTools: [...permissions_config_1.ROLE_NOT_ALLOWED_TOOLS['orchestrator']],
            maxTurns: permissions_config_1.ROLE_MAX_TURNS['orchestrator'],
            usageAccumulator: this.usageAccumulator,
        });
        const jsonStr = extractJson(result.finalText);
        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        }
        catch (err) {
            (0, ndjson_emitter_1.logError)('Failed to parse orchestration plan JSON', err);
            throw new Error(`Invalid plan JSON from model: ${jsonStr.slice(0, 200)}`);
        }
        const plan = {
            planId: parsed.planId ?? (0, uuid_1.v4)(),
            runId: this.runId,
            tasks: parsed.tasks.map(t => ({
                ...t,
                taskId: t.taskId ?? (0, uuid_1.v4)(),
                status: 'pending',
            })),
            createdAt: new Date().toISOString(),
        };
        const planEvent = {
            type: 'orchestrator_plan',
            runId: this.runId,
            tasks: plan.tasks,
            timestamp: plan.createdAt,
        };
        (0, ndjson_emitter_1.emit)(planEvent);
        return plan;
    }
    async execute(plan, opts) {
        const results = new Map();
        for (const task of plan.tasks) {
            if (task.status === 'completed' && task.result !== undefined) {
                results.set(task.taskId, task.result);
            }
        }
        const tasksToRun = plan.tasks.filter(t => {
            if (t.status === 'completed')
                return false;
            if (opts?.onlyTypes && !opts.onlyTypes.includes(t.type))
                return false;
            return true;
        });
        const pending = [...tasksToRun];
        let iterations = 0;
        const maxIterations = plan.tasks.length * 2;
        while (pending.length > 0 && iterations < maxIterations) {
            iterations++;
            const ready = pending.filter(t => t.dependsOn.every(depId => results.has(depId)));
            if (ready.length === 0) {
                throw new Error('No tasks ready to execute — possible dependency cycle in plan');
            }
            const task = ready[0];
            const idx = pending.indexOf(task);
            pending.splice(idx, 1);
            (0, ndjson_emitter_1.log)(`Executing task ${task.taskId}: [${task.type}] ${task.description.slice(0, 80)}...`);
            task.status = 'in_progress';
            emitTaskUpdate(this.runId, task, 'in_progress');
            try {
                const taskId = task.taskId;
                const result = await this.runTask(task, results, taskId);
                task.status = 'completed';
                task.result = result;
                task.completedAt = new Date().toISOString();
                results.set(task.taskId, result);
                emitTaskUpdate(this.runId, task, 'completed', result);
            }
            catch (err) {
                task.status = 'failed';
                emitTaskUpdate(this.runId, task, 'failed');
                (0, ndjson_emitter_1.logError)(`Task ${task.taskId} failed`, err);
                throw err;
            }
        }
        return results;
    }
    async runTask(task, results, instanceId) {
        const baseOptions = {
            runId: this.runId,
            taskId: task.taskId,
            instanceId,
            usageAccumulator: this.usageAccumulator,
        };
        switch (task.type) {
            case 'explore': {
                const agent = new explorer_agent_1.ExplorerAgent(baseOptions);
                const result = await agent.explore(task.description);
                return result.finalText;
            }
            case 'implement': {
                const explorerContext = task.dependsOn
                    .map(depId => results.get(depId))
                    .filter(Boolean)
                    .join('\n\n---\n\n');
                const agent = new implementer_agent_1.ImplementerAgent(baseOptions);
                const result = await agent.implement(task.description, explorerContext || undefined);
                return result.finalText;
            }
            case 'review': {
                const agent = new reviewer_agent_1.ReviewerAgent(baseOptions);
                const result = await agent.review(task.description);
                return result.finalText;
            }
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }
}
exports.OrchestratorAgent = OrchestratorAgent;
function extractJson(text) {
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch)
        return fenceMatch[1].trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1)
        return text.slice(start, end + 1);
    return text.trim();
}
function emitTaskUpdate(runId, task, status, result) {
    const event = {
        type: 'task_update',
        runId,
        taskId: task.taskId,
        status,
        agentRole: task.agentRole,
        result,
        timestamp: new Date().toISOString(),
    };
    (0, ndjson_emitter_1.emit)(event);
}
//# sourceMappingURL=orchestrator-agent.js.map