export declare class DevStudioApiClient {
    private readonly baseUrl;
    private readonly webhookToken;
    constructor(baseUrl: string, webhookToken: string);
    postEvent(runId: string, event: Record<string, unknown>): Promise<void>;
    updateStatus(runId: string, status: string): Promise<void>;
    savePlanCheckpoint(runId: string, payload: Record<string, unknown>): Promise<void>;
    getPlanCheckpoint(runId: string): Promise<Record<string, unknown>>;
    saveSummary(runId: string, payload: Record<string, unknown>): Promise<void>;
    private get authHeader();
    private post;
    private get;
}
