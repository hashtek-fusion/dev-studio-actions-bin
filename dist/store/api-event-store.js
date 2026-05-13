"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEventStore = void 0;
const ndjson_emitter_1 = require("../logger/ndjson-emitter");
class ApiEventStore {
    constructor(runId, apiClient) {
        this.runId = runId;
        this.apiClient = apiClient;
    }
    async record(event) {
        try {
            await this.apiClient.postEvent(this.runId, event);
        }
        catch (err) {
            (0, ndjson_emitter_1.logError)(`[api-event-store] Failed to send event type=${event.type}`, err);
        }
    }
}
exports.ApiEventStore = ApiEventStore;
//# sourceMappingURL=api-event-store.js.map