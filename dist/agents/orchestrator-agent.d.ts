import { OrchestrationPlan } from '../types';
export declare class OrchestratorAgent {
    private readonly runId;
    private readonly repoFullName;
    private readonly prompt;
    private readonly usageAccumulator;
    constructor(runId: string, repoFullName: string, prompt: string, usageAccumulator: Map<string, {
        inputTokens: number;
        outputTokens: number;
    }>);
    plan(): Promise<OrchestrationPlan>;
    execute(plan: OrchestrationPlan, opts?: {
        onlyTypes?: Array<'explore' | 'implement' | 'review'>;
    }): Promise<Map<string, string>>;
    private runTask;
}
