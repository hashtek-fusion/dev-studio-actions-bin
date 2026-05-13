import { OrchestratorEnv } from './config/env';
export declare class OrchestratorRunner {
    private readonly env;
    private readonly usageAccumulator;
    private totalToolCalls;
    constructor(env: OrchestratorEnv);
    run(): Promise<void>;
    private runPlanPhase;
    private runExecutePhase;
    private getTotalUsage;
    private emitPlanAwaitingApproval;
    private emitSummary;
}
