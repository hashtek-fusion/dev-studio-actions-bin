import { DevStudioApiClient } from '../client/devstudio-api-client';
import { OrchestrationPlan } from '../types';
export declare class ApiPlanStore {
    private readonly apiClient;
    constructor(apiClient: DevStudioApiClient);
    saveCheckpoint(runId: string, plan: OrchestrationPlan, planVersion: number): Promise<void>;
    loadCheckpoint(runId: string): Promise<OrchestrationPlan>;
}
