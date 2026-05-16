"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPlanStore = void 0;
class ApiPlanStore {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    async saveCheckpoint(runId, plan, planVersion) {
        await this.apiClient.savePlanCheckpoint(runId, {
            plan: {
                planId: plan.planId,
                tasks: plan.tasks,
                createdAt: plan.createdAt,
            },
            planVersion,
        });
    }
    async loadCheckpoint(runId) {
        const raw = await this.apiClient.getPlanCheckpoint(runId);
        const planData = raw['plan'];
        if (!planData) {
            throw new Error(`Plan checkpoint for run ${runId} is missing plan data — was it saved correctly?`);
        }
        return {
            planId: planData['planId'],
            runId,
            tasks: planData['tasks'],
            createdAt: planData['createdAt'],
        };
    }
}
exports.ApiPlanStore = ApiPlanStore;
//# sourceMappingURL=api-plan-store.js.map