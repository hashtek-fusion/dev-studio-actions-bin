export interface GitConfig {
    repoFullName: string;
    targetBranch: string;
    runId: string;
    ticketRef?: string;
}
export declare class GitOperations {
    private readonly config;
    constructor(config: GitConfig);
    configure(): Promise<void>;
    createBranch(): Promise<string>;
    commitAll(message: string): Promise<boolean>;
    push(branchName: string): Promise<void>;
}
