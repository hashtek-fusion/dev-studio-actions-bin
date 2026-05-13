export type OrchestratorPhase = 'plan' | 'execute';
export interface OrchestratorEnv {
    readonly runId: string;
    readonly projectId: string;
    readonly repoFullName: string;
    readonly prompt: string;
    readonly targetBranch: string;
    readonly claudeCodeUseBedrock: boolean;
    readonly anthropicDefaultSonnetModel: string;
    readonly anthropicDefaultHaikuModel: string;
    readonly phase: OrchestratorPhase;
    readonly devstudioApiUrl: string;
    readonly devstudioWebhookToken: string;
    readonly revisionFeedback: string | undefined;
    readonly planVersion: number;
}
export declare function loadAndValidateEnv(): OrchestratorEnv;
