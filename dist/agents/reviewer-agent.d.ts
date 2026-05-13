import { AgentSdkResult } from './agent-sdk-runner';
export interface ReviewerAgentOptions {
    runId: string;
    taskId: string;
    instanceId: string;
    usageAccumulator: Map<string, {
        inputTokens: number;
        outputTokens: number;
    }>;
    cwd?: string;
}
export interface ReviewReport {
    buildPassed: boolean;
    testsPassed: boolean;
    testCount: {
        passed: number;
        failed: number;
    };
    securityIssues: string[];
    typeSafetyIssues: string[];
    styleIssues: string[];
    approved: boolean;
    summary: string;
}
export declare class ReviewerAgent {
    private readonly options;
    constructor(options: ReviewerAgentOptions);
    review(taskDescription: string, implementerReport?: string): Promise<AgentSdkResult>;
    static parseReport(finalText: string): ReviewReport | null;
}
