"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPlanStore = void 0;
class ApiPlanStore {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async saveCheckpoint(runId, plan, planVersion) {
        await this.apiClient.savePlanCheckpoint(runId, {
            planId: plan.planId,
            planVersion,
            tasks: plan.tasks,
            createdAt: plan.createdAt,
            savedAt: new Date().toISOString(),
        });
    }
    async loadCheckpoint(runId) {
        const raw = await this.apiClient.getPlanCheckpoint(runId);
        return {
            planId: raw['planId'],
            runId,
            tasks: raw['tasks'],
            createdAt: raw['createdAt'],
        };
    }
}
exports.ApiPlanStore = ApiPlanStore;
//# sourceMappingURL=api-plan-store.js.map