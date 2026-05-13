"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorRunner = void 0;
const permissions_config_1 = require("./config/permissions.config");
const orchestrator_agent_1 = require("./agents/orchestrator-agent");
const git_operations_1 = require("./github/git-operations");
const devstudio_api_client_1 = require("./client/devstudio-api-client");
const api_event_store_1 = require("./store/api-event-store");
const api_plan_store_1 = require("./store/api-plan-store");
const ndjson_emitter_1 = require("./logger/ndjson-emitter");
class OrchestratorRunner {
    constructor(env) {
        this.env = env;
        this.usageAccumulator = new Map();
        this.totalToolCalls = 0;
    }
    async run() {
        const apiClient = new devstudio_api_client_1.DevStudioApiClient(this.env.devstudioApiUrl, this.env.devstudioWebhookToken);
        (0, ndjson_emitter_1.initApiEventStore)(new api_event_store_1.ApiEventStore(this.env.runId, apiClient));
        const { phase } = this.env;
        if (phase === 'plan') {
            return this.runPlanPhase(apiClient);
        }
        return this.runExecutePhase(apiClient);
    }
    async runPlanPhase(apiClient) {
        const { runId, repoFullName, targetBranch, prompt, revisionFeedback, planVersion } = this.env;
        (0, ndjson_emitter_1.log)(`Starting plan phase for run ${runId} (v${planVersion})`);
        (0, ndjson_emitter_1.log)(`Repository: ${repoFullName}, target branch: ${targetBranch}`);
        const git = new git_operations_1.GitOperations({ repoFullName, targetBranch, runId });
        const effectivePrompt = revisionFeedback
            ? `${prompt}\n\n---\nRevision feedback from approver:\n${revisionFeedback}`
            : prompt;
        const orchestrator = new orchestrator_agent_1.OrchestratorAgent(runId, repoFullName, effectivePrompt, this.usageAccumulator);
        const planStore = new api_plan_store_1.ApiPlanStore(apiClient);
        try {
            await git.configure();
            await git.createBranch();
            const plan = await orchestrator.plan();
            (0, ndjson_emitter_1.log)(`Plan created with ${plan.tasks.length} tasks`);
            await orchestrator.execute(plan, { onlyTypes: ['explore'] });
            (0, ndjson_emitter_1.log)('Explore tasks complete');
            await planStore.saveCheckpoint(runId, plan, planVersion);
            (0, ndjson_emitter_1.log)('Plan checkpoint saved via DevStudio API');
            this.emitPlanAwaitingApproval(plan, planVersion);
            await apiClient.updateStatus(runId, 'WAITING_FOR_APPROVAL');
            (0, ndjson_emitter_1.log)('Status → WAITING_FOR_APPROVAL');
        }
        catch (err) {
            (0, ndjson_emitter_1.logError)('Plan phase failed', err);
            await apiClient.updateStatus(runId, 'FAILURE').catch(() => { });
            process.exit(1);
        }
    }
    async runExecutePhase(apiClient) {
        const { runId, repoFullName, targetBranch } = this.env;
        (0, ndjson_emitter_1.log)(`Starting execute phase for run ${runId}`);
        (0, ndjson_emitter_1.log)(`Repository: ${repoFullName}, target branch: ${targetBranch}`);
        const git = new git_operations_1.GitOperations({ repoFullName, targetBranch, runId });
        const planStore = new api_plan_store_1.ApiPlanStore(apiClient);
        try {
            await git.configure();
            const branchName = await git.createBranch();
            const plan = await planStore.loadCheckpoint(runId);
            (0, ndjson_emitter_1.log)(`Loaded plan ${plan.planId} with ${plan.tasks.length} tasks`);
            const orchestrator = new orchestrator_agent_1.OrchestratorAgent(runId, repoFullName, this.env.prompt, this.usageAccumulator);
            await orchestrator.execute(plan, { onlyTypes: ['implement', 'review'] });
            (0, ndjson_emitter_1.log)('Implement and review tasks complete');
            const committed = await git.commitAll(`feat: implement feature via DevStudio orchestrator [run:${runId}] [skip ci]`);
            if (committed) {
                await git.push(branchName);
            }
            this.emitSummary('success', branchName);
            const usage = this.getTotalUsage();
            await apiClient.saveSummary(runId, {
                status: 'success',
                prBranch: branchName,
                committed,
                totalTasks: plan.tasks.length,
                completedTasks: plan.tasks.filter(t => t.status === 'completed').length,
                totalInputTokens: usage.inputTokens,
                totalOutputTokens: usage.outputTokens,
                estimatedCostUsd: (0, permissions_config_1.computeCostUsd)(this.usageAccumulator),
                completedAt: new Date().toISOString(),
            });
            await apiClient.updateStatus(runId, 'SUCCESS');
            (0, ndjson_emitter_1.log)('Status → SUCCESS');
        }
        catch (err) {
            (0, ndjson_emitter_1.logError)('Execute phase failed', err);
            this.emitSummary('failure', undefined, undefined, err instanceof Error ? err.message : String(err));
            await apiClient.updateStatus(runId, 'FAILURE').catch(() => { });
            process.exit(1);
        }
    }
    getTotalUsage() {
        let inputTokens = 0;
        let outputTokens = 0;
        for (const v of this.usageAccumulator.values()) {
            inputTokens += v.inputTokens;
            outputTokens += v.outputTokens;
        }
        return { inputTokens, outputTokens };
    }
    emitPlanAwaitingApproval(plan, planVersion) {
        const event = {
            type: 'plan_awaiting_approval',
            runId: this.env.runId,
            planId: plan.planId,
            planVersion,
            tasks: plan.tasks,
            timestamp: new Date().toISOString(),
        };
        (0, ndjson_emitter_1.emit)(event);
    }
    emitSummary(status, prBranch, prUrl, errorMessage) {
        const totalInputTokens = [...this.usageAccumulator.values()].reduce((s, v) => s + v.inputTokens, 0);
        const totalOutputTokens = [...this.usageAccumulator.values()].reduce((s, v) => s + v.outputTokens, 0);
        const summaryEvent = {
            type: 'orchestrator_summary',
            runId: this.env.runId,
            status,
            totalInputTokens,
            totalOutputTokens,
            totalToolCalls: this.totalToolCalls,
            estimatedCostUsd: (0, permissions_config_1.computeCostUsd)(this.usageAccumulator),
            prBranch,
            prUrl,
            errorMessage,
            timestamp: new Date().toISOString(),
        };
        (0, ndjson_emitter_1.emit)(summaryEvent);
    }
}
exports.OrchestratorRunner = OrchestratorRunner;
//# sourceMappingURL=runner.js.map