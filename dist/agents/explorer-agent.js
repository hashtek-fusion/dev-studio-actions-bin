"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerAgent = void 0;
const agent_sdk_runner_1 = require("./agent-sdk-runner");
const permissions_config_1 = require("../config/permissions.config");
class ExplorerAgent {
    constructor(options) {
        this.options = options;
    }
    async explore(taskDescription) {
        const model = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL ?? 'us.anthropic.claude-haiku-4-5-20251001-v1:0';
        return (0, agent_sdk_runner_1.runWithAgentSdk)(taskDescription, {
            runId: this.options.runId,
            taskId: this.options.taskId,
            role: 'explorer',
            model,
            systemPrompt: permissions_config_1.EXPLORER_SYSTEM_PROMPT,
            allowedTools: [...permissions_config_1.ROLE_ALLOWED_TOOLS['explorer']],
            disallowedTools: [...permissions_config_1.ROLE_NOT_ALLOWED_TOOLS['explorer']],
            maxTurns: permissions_config_1.ROLE_MAX_TURNS['explorer'],
            usageAccumulator: this.options.usageAccumulator,
            cwd: this.options.cwd,
        });
    }
}
exports.ExplorerAgent = ExplorerAgent;
//# sourceMappingURL=explorer-agent.js.map