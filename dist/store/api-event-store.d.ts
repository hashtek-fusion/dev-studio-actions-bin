import { DevStudioApiClient } from '../client/devstudio-api-client';
import { OrchestratorEvent } from '../types';
export declare class ApiEventStore {
    private readonly runId;
    private readonly apiClient;
    constructor(runId: string, apiClient: DevStudioApiClient);
    record(event: OrchestratorEvent): Promise<void>;
}
