"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewerAgent = void 0;
const agent_sdk_runner_1 = require("./agent-sdk-runner");
const permissions_config_1 = require("../config/permissions.config");
class ReviewerAgent {
    constructor(options) {
        this.options = options;
    }
    async review(taskDescription, implementerReport) {
        const model = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'us.anthropic.claude-sonnet-4-6';
        const prompt = implementerReport
            ? `## Implementer Report\n${implementerReport}\n\n## Review Task\n${taskDescription}`
            : `Review the implementation of the following task. Use git diff and run tests/build to verify.\n\nTask:\n${taskDescription}`;
        return (0, agent_sdk_runner_1.runWithAgentSdk)(prompt, {
            runId: this.options.runId,
            taskId: this.options.taskId,
            role: 'reviewer',
            model,
            systemPrompt: permissions_config_1.REVIEWER_SYSTEM_PROMPT,
            allowedTools: ['Read', 'Bash', 'Glob', 'Grep'],
            disallowedTools: ['Task', 'Edit', 'Write'],
            maxTurns: permissions_config_1.ROLE_MAX_TURNS['reviewer'],
            usageAccumulator: this.options.usageAccumulator,
            cwd: this.options.cwd,
        });
    }
    static parseReport(finalText) {
        try {
            const match = finalText.match(/\{[\s\S]*\}/);
            if (!match)
                return null;
            return JSON.parse(match[0]);
        }
        catch {
            return null;
        }
    }
}
exports.ReviewerAgent = ReviewerAgent;
//# sourceMappingURL=reviewer-agent.js.map