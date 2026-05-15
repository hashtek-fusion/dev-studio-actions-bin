"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithAgentSdk = runWithAgentSdk;
const claude_agent_sdk_1 = require("@anthropic-ai/claude-agent-sdk");
const ndjson_emitter_1 = require("../logger/ndjson-emitter");
async function runWithAgentSdk(prompt, options) {
    const { runId, taskId, role, model, systemPrompt, allowedTools, disallowedTools, maxTurns, usageAccumulator } = options;
    let finalText = '';
    let toolCallCount = 0;
    const toolStartTimes = new Map();
    const preToolHook = async (input) => {
        const inp = input;
        const id = inp['tool_use_id'] ?? 'unknown';
        toolStartTimes.set(id, Date.now());
        return {};
    };
    const postToolHook = async (input) => {
        const inp = input;
        const id = inp['tool_use_id'] ?? 'unknown';
        const startTime = toolStartTimes.get(id) ?? Date.now();
        const durationMs = Date.now() - startTime;
        toolStartTimes.delete(id);
        const rawOutput = inp['tool_response'] ?? '';
        const outputContent = (typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput)).slice(0, 50 * 1024);
        const toolCallEvent = {
            type: 'tool_call',
            runId,
            taskId,
            agentRole: role,
            toolName: (inp['tool_name'] ?? 'unknown'),
            inputContent: JSON.stringify(inp['tool_input'] ?? {}),
            outputContent,
            durationMs,
            success: true,
            timestamp: new Date().toISOString(),
        };
        (0, ndjson_emitter_1.emit)(toolCallEvent);
        toolCallCount++;
        const toolName = inp['tool_name'] ?? '';
        if (toolName === 'Task') {
            try {
                const envelope = JSON.parse(typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput));
                const text = (envelope.content ?? [])
                    .filter(b => b.type === 'text' && typeof b.text === 'string')
                    .map(b => b.text)
                    .join('');
                if (text)
                    lastToolOutputText = text;
            }
            catch {
            }
        }
        return {};
    };
    const postToolFailureHook = async (input) => {
        const inp = input;
        const id = inp['tool_use_id'] ?? 'unknown';
        const startTime = toolStartTimes.get(id) ?? Date.now();
        const durationMs = Date.now() - startTime;
        toolStartTimes.delete(id);
        const errorMessage = String(inp['error'] ?? inp['tool_error'] ?? 'Unknown error');
        const toolCallEvent = {
            type: 'tool_call',
            runId,
            taskId,
            agentRole: role,
            toolName: (inp['tool_name'] ?? 'unknown'),
            inputContent: JSON.stringify(inp['tool_input'] ?? {}),
            outputContent: `Error: ${errorMessage}`.slice(0, 50 * 1024),
            durationMs,
            success: false,
            errorMessage,
            timestamp: new Date().toISOString(),
        };
        (0, ndjson_emitter_1.emit)(toolCallEvent);
        toolCallCount++;
        return {};
    };
    let cumulativeInputTokens = 0;
    let cumulativeOutputTokens = 0;
    let cumulativeCacheReadTokens = 0;
    let cumulativeCacheWriteTokens = 0;
    let lastAssistantText = '';
    let lastToolOutputText = '';
    try {
        for await (const message of (0, claude_agent_sdk_1.query)({
            prompt,
            options: {
                cwd: options.cwd ?? process.cwd(),
                allowedTools,
                disallowedTools,
                systemPrompt,
                maxTurns,
                model,
                permissionMode: 'bypassPermissions',
                allowDangerouslySkipPermissions: true,
                hooks: {
                    PreToolUse: [{ matcher: '.*', hooks: [preToolHook] }],
                    PostToolUse: [{ matcher: '.*', hooks: [postToolHook] }],
                    PostToolUseFailure: [{ matcher: '.*', hooks: [postToolFailureHook] }],
                },
            },
        })) {
            const msg = message;
            if (msg['type'] === 'assistant') {
                const msgObj = msg['message'];
                console.log(JSON.stringify(msgObj, null, 2));
                const content = (msgObj?.['content'] ?? msg['content']);
                if (Array.isArray(content)) {
                    const text = content
                        .filter(b => b.type === 'text' && typeof b.text === 'string')
                        .map(b => b.text)
                        .join('');
                    if (text)
                        lastAssistantText = text;
                }
            }
            if ('result' in message) {
                finalText = message.result ?? '';
            }
            if (msg['type'] === 'result') {
                const usage = msg['usage'];
                if (usage) {
                    cumulativeInputTokens = usage['input_tokens'] ?? 0;
                    cumulativeOutputTokens = usage['output_tokens'] ?? 0;
                    cumulativeCacheReadTokens = usage['cache_read_input_tokens'] ?? 0;
                    cumulativeCacheWriteTokens = usage['cache_creation_input_tokens'] ?? 0;
                }
            }
        }
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isProcessExit = errMsg.includes('process exited with code 1');
        const capturedText = lastAssistantText.length > finalText.length
            ? lastAssistantText
            : finalText;
        if (isProcessExit && capturedText.trim().length > 0) {
            (0, ndjson_emitter_1.logError)(`Agent SDK process exited (code 1) for role=${role} task=${taskId} — ` +
                `max turns likely reached; using partial output (${capturedText.length} chars)`, err);
            finalText = capturedText;
        }
        else {
            (0, ndjson_emitter_1.logError)(`Agent SDK query failed for role=${role} task=${taskId}`, err);
            throw err;
        }
    }
    if (lastAssistantText.length > finalText.length) {
        finalText = lastAssistantText;
    }
    if (!finalText && lastToolOutputText) {
        finalText = lastToolOutputText;
    }
    const existing = usageAccumulator.get(model) ?? { inputTokens: 0, outputTokens: 0 };
    usageAccumulator.set(model, {
        inputTokens: existing.inputTokens + cumulativeInputTokens,
        outputTokens: existing.outputTokens + cumulativeOutputTokens,
    });
    const usageEvent = {
        type: 'agent_usage',
        runId,
        taskId,
        agentRole: role,
        model: model,
        inputTokens: cumulativeInputTokens,
        outputTokens: cumulativeOutputTokens,
        cacheReadTokens: cumulativeCacheReadTokens,
        cacheWriteTokens: cumulativeCacheWriteTokens,
        timestamp: new Date().toISOString(),
    };
    (0, ndjson_emitter_1.emit)(usageEvent);
    return { finalText, toolCallCount };
}
//# sourceMappingURL=agent-sdk-runner.js.map