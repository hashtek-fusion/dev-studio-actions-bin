"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const runner_1 = require("./runner");
const ndjson_emitter_1 = require("./logger/ndjson-emitter");
async function main() {
    const env = (0, env_1.loadAndValidateEnv)();
    const runner = new runner_1.OrchestratorRunner(env);
    await runner.run();
}
main().catch((err) => {
    (0, ndjson_emitter_1.logError)('Fatal error', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map