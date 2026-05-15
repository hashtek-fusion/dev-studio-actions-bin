"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevStudioApiClient = void 0;
const fetch = require('node-fetch');
const ndjson_emitter_1 = require("../logger/ndjson-emitter");
const DEFAULT_RETRY = { maxAttempts: 3, baseDelayMs: 500 };
class DevStudioApiClient {
    constructor(baseUrl, webhookToken) {
        this.baseUrl = baseUrl;
        this.webhookToken = webhookToken;
    }
    async postEvent(runId, event) {
        await this.post(`/runs/${runId}/events`, event);
    }
    async updateStatus(runId, status) {
        await this.post(`/runs/${runId}/status`, { status });
    }
    async savePlanCheckpoint(runId, payload) {
        await this.post(`/runs/${runId}/plan-checkpoint`, payload);
    }
    async getPlanCheckpoint(runId) {
        return this.get(`/runs/${runId}/plan-checkpoint`);
    }
    async saveSummary(runId, payload) {
        await this.post(`/runs/${runId}/summary`, payload);
    }
    get authHeader() {
        return `Bearer ${this.webhookToken}`;
    }
    async post(path, body, retry = DEFAULT_RETRY) {
        if (!this.baseUrl) {
            (0, ndjson_emitter_1.log)(`[api-client] DEVSTUDIO_API_URL not set — skipping POST ${path}`);
            return;
        }
        for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
            try {
                const res = await fetch(`${this.baseUrl}${path}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.authHeader,
                    },
                    body: JSON.stringify(body),
                });
                if (res.ok)
                    return;
                const text = await res.text();
                (0, ndjson_emitter_1.logError)(`[api-client] POST ${path} → HTTP ${res.status}: ${text}`, null);
                if (res.status < 500)
                    return;
            }
            catch (err) {
                (0, ndjson_emitter_1.logError)(`[api-client] POST ${path} attempt ${attempt} failed`, err);
            }
            if (attempt < retry.maxAttempts) {
                await new Promise(r => setTimeout(r, retry.baseDelayMs * Math.pow(2, attempt - 1)));
            }
        }
    }
    async get(path) {
        if (!this.baseUrl)
            throw new Error(`DEVSTUDIO_API_URL not set — cannot GET ${path}`);
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: 'GET',
            headers: { 'Authorization': this.authHeader },
        });
        let responseText = '';
        if (!res.ok) {
            responseText = await res.text();
            throw new Error(`GET ${path} → HTTP ${res.status}: ${responseText}`);
        }
        console.log(`[api-client] GET ${path}`);
        console.log(responseText);
        return res.json();
    }
}
exports.DevStudioApiClient = DevStudioApiClient;
//# sourceMappingURL=devstudio-api-client.js.map