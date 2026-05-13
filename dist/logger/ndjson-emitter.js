"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApiEventStore = initApiEventStore;
exports.emit = emit;
exports.log = log;
exports.logError = logError;
let _store = null;
function initApiEventStore(store) {
    _store = store;
}
function emit(event) {
    process.stdout.write(JSON.stringify(event) + '\n');
    if (_store) {
        _store.record(event).catch((err) => {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`[ndjson-emitter:error] ApiEventStore.record failed: ${msg}\n`);
        });
    }
}
function log(message) {
    process.stdout.write(`[orchestrator] ${message}\n`);
}
function logError(message, error) {
    const errMsg = error instanceof Error ? ` — ${error.message}` : '';
    process.stderr.write(`[orchestrator:error] ${message}${errMsg}\n`);
}
//# sourceMappingURL=ndjson-emitter.js.map