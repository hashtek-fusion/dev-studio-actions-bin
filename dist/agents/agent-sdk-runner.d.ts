import { AgentRole } from '../types';
export interface AgentSdkRunnerOptions {
    runId: string;
    taskId: string;
    role: AgentRole;
    model: string;
    systemPrompt: string;
    allowedTools: string[];
    disallowedTools?: string[];
    maxTurns: number;
    usageAccumulator: Map<string, {
        inputTokens: number;
        outputTokens: number;
    }>;
    cwd?: string;
}
export interface AgentSdkResult {
    finalText: string;
    toolCallCount: number;
}
export declare function runWithAgentSdk(prompt: string, options: AgentSdkRunnerOptions): Promise<AgentSdkResult>;
