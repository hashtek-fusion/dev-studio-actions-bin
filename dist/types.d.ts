export type AgentRole = 'orchestrator' | 'explorer' | 'implementer' | 'reviewer';
export type AgentModel = 'claude-haiku-4-5' | 'claude-sonnet-4-6';
export type ToolName = 'read_file' | 'list_directory' | 'search_files' | 'glob' | 'write_file' | 'edit_file' | 'create_directory' | 'bash' | 'spawn_agent';
export interface AgentPermissions {
    readonly role: AgentRole;
    readonly allowedTools: readonly ToolName[];
    readonly maxTurns: number;
    readonly maxTokensPerTurn: number;
}
export interface PlannedTask {
    readonly taskId: string;
    readonly type: 'explore' | 'implement' | 'review';
    readonly description: string;
    readonly dependsOn: readonly string[];
    readonly agentRole: AgentRole;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: string;
    startedAt?: string;
    completedAt?: string;
}
export interface OrchestrationPlan {
    readonly planId: string;
    readonly runId: string;
    tasks: PlannedTask[];
    readonly createdAt: string;
}
export interface OrchestratorPlanEvent {
    readonly type: 'orchestrator_plan';
    readonly runId: string;
    readonly tasks: PlannedTask[];
    readonly timestamp: string;
}
export interface TaskUpdateEvent {
    readonly type: 'task_update';
    readonly runId: string;
    readonly taskId: string;
    readonly status: PlannedTask['status'];
    readonly agentRole: AgentRole;
    readonly model?: AgentModel;
    readonly result?: string;
    readonly timestamp: string;
}
export interface ToolCallEvent {
    readonly type: 'tool_call';
    readonly runId: string;
    readonly taskId: string;
    readonly agentRole: AgentRole;
    readonly toolName: ToolName;
    readonly inputContent: string;
    readonly outputContent: string;
    readonly durationMs: number;
    readonly success: boolean;
    readonly errorMessage?: string;
    readonly timestamp: string;
}
export interface AgentUsageEvent {
    readonly type: 'agent_usage';
    readonly runId: string;
    readonly taskId: string;
    readonly agentRole: AgentRole;
    readonly model: AgentModel;
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly cacheReadTokens: number;
    readonly cacheWriteTokens: number;
    readonly timestamp: string;
}
export interface OrchestratorSummaryEvent {
    readonly type: 'orchestrator_summary';
    readonly runId: string;
    readonly status: 'success' | 'failure';
    readonly totalInputTokens: number;
    readonly totalOutputTokens: number;
    readonly totalToolCalls: number;
    readonly estimatedCostUsd: number;
    readonly prBranch?: string;
    readonly prUrl?: string;
    readonly errorMessage?: string;
    readonly timestamp: string;
}
export interface PlanAwaitingApprovalEvent {
    readonly type: 'plan_awaiting_approval';
    readonly runId: string;
    readonly planId: string;
    readonly planVersion: number;
    readonly tasks: PlannedTask[];
    readonly timestamp: string;
}
export type OrchestratorEvent = OrchestratorPlanEvent | TaskUpdateEvent | ToolCallEvent | AgentUsageEvent | OrchestratorSummaryEvent | PlanAwaitingApprovalEvent;
export type OrchestratorEventType = OrchestratorEvent['type'];
