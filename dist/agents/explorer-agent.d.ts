import { AgentSdkResult } from './agent-sdk-runner';
export interface ExplorerAgentOptions {
    runId: string;
    taskId: string;
    instanceId: string;
    usageAccumulator: Map<string, {
        inputTokens: number;
        outputTokens: number;
    }>;
    cwd?: string;
}
export declare class ExplorerAgent {
    private readonly options;
    constructor(options: ExplorerAgentOptions);
    explore(taskDescription: string): Promise<AgentSdkResult>;
}
