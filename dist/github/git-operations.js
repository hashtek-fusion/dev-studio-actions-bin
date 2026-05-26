"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitOperations = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const ndjson_emitter_1 = require("../logger/ndjson-emitter");
const execFileAsync = (0, node_util_1.promisify)(node_child_process_1.execFile);
class GitOperations {
    constructor(config) {
        this.config = config;
    }
    async configure() {
        await execFileAsync('git', ['config', 'user.name', 'DevStudio Orchestrator']);
        await execFileAsync('git', ['config', 'user.email', 'devstudio-bot@users.noreply.github.com']);
    }
    async createBranch() {
        const slug = this.config.ticketRef ?? `run-${this.config.runId}`;
        const timestamp = Math.floor(Date.now() / 1000);
        const branchName = `devstudio/${slug.toLowerCase().replace(/[^a-z0-9/_-]/g, '-')}-${timestamp}`;
        await execFileAsync('git', ['checkout', '-b', branchName]);
        (0, ndjson_emitter_1.log)(`Created branch: ${branchName}`);
        return branchName;
    }
    async commitAll(message) {
        await execFileAsync('git', ['add', '-A']);
        const { stdout } = await execFileAsync('git', ['diff', '--cached', '--name-only']);
        if (!stdout.trim()) {
            (0, ndjson_emitter_1.log)('No changes to commit — skipping push and PR');
            return false;
        }
        await execFileAsync('git', ['commit', '-m', message]);
        return true;
    }
    async push(branchName) {
        await execFileAsync('git', ['push', 'origin', branchName]);
        (0, ndjson_emitter_1.log)(`Pushed branch: ${branchName}`);
    }
}
exports.GitOperations = GitOperations;
//# sourceMappingURL=git-operations.js.map