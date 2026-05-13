"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplementerAgent = void 0;
const agent_sdk_runner_1 = require("./agent-sdk-runner");
const permissions_config_1 = require("../config/permissions.config");
class ImplementerAgent {
    constructor(options) {
        this.options = options;
    }
    async implement(taskDescription, explorerReport) {
        const model = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'us.anthropic.claude-sonnet-4-6';
        const prompt = explorerReport
            ? `## Codebase Context (from Explorer)\n${explorerReport}\n\n## Task\n${taskDescription}`
            : taskDescription;
        return (0, agent_sdk_runner_1.runWithAgentSdk)(prompt, {
            runId: this.options.runId,
            taskId: this.options.taskId,
            role: 'implementer',
            model,
            systemPrompt: permissions_config_1.IMPLEMENTER_SYSTEM_PROMPT,
            allowedTools: [...permissions_config_1.ROLE_ALLOWED_TOOLS['implementer']],
            disallowedTools: [...permissions_config_1.ROLE_NOT_ALLOWED_TOOLS['implementer']],
            maxTurns: permissions_config_1.ROLE_MAX_TURNS['implementer'],
            usageAccumulator: this.options.usageAccumulator,
            cwd: this.options.cwd,
        });
    }
}
exports.ImplementerAgent = ImplementerAgent;
//# sourceMappingURL=implementer-agent.js.map