"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAndValidateEnv = loadAndValidateEnv;
function loadAndValidateEnv() {
    const required = {
        DEVSTUDIO_RUN_ID: process.env.DEVSTUDIO_RUN_ID,
        DEVSTUDIO_PROJECT_ID: process.env.DEVSTUDIO_PROJECT_ID,
        REPO_FULL_NAME: process.env.REPO_FULL_NAME,
        DEVSTUDIO_PROMPT: process.env.DEVSTUDIO_PROMPT,
        DEVSTUDIO_API_URL: process.env.DEVSTUDIO_API_URL,
        DEVSTUDIO_WEBHOOK_TOKEN: process.env.DEVSTUDIO_WEBHOOK_TOKEN,
    };
    const missing = Object.entries(required)
        .filter(([, v]) => !v)
        .map(([k]) => k);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    const rawPhase = process.env.DEVSTUDIO_PHASE ?? 'plan';
    if (rawPhase !== 'plan' && rawPhase !== 'execute') {
        throw new Error(`Invalid DEVSTUDIO_PHASE value: "${rawPhase}". Must be 'plan' or 'execute'.`);
    }
    return {
        runId: required.DEVSTUDIO_RUN_ID,
        projectId: required.DEVSTUDIO_PROJECT_ID,
        repoFullName: required.REPO_FULL_NAME,
        prompt: required.DEVSTUDIO_PROMPT,
        devstudioApiUrl: required.DEVSTUDIO_API_URL,
        devstudioWebhookToken: required.DEVSTUDIO_WEBHOOK_TOKEN,
        targetBranch: process.env.TARGET_BRANCH ?? 'main',
        claudeCodeUseBedrock: process.env.CLAUDE_CODE_USE_BEDROCK === '1',
        anthropicDefaultSonnetModel: process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? 'us.anthropic.claude-sonnet-4-6',
        anthropicDefaultHaikuModel: process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL ?? 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
        phase: rawPhase,
        revisionFeedback: process.env.DEVSTUDIO_REVISION_FEEDBACK || undefined,
        planVersion: parseInt(process.env.DEVSTUDIO_PLAN_VERSION ?? '1', 10),
    };
}
//# sourceMappingURL=env.js.map