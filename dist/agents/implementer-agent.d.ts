import { AgentSdkResult } from './agent-sdk-runner';
export interface ImplementerAgentOptions {
    runId: string;
    taskId: string;
    instanceId: string;
    usageAccumulator: Map<string, {
        inputTokens: number;
        outputTokens: number;
    }>;
    cwd?: string;
}
export declare class ImplementerAgent {
    private readonly options;
    constructor(options: ImplementerAgentOptions);
    implement(taskDescription: string, explorerReport?: string): Promise<AgentSdkResult>;
}
