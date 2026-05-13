import { OrchestratorEvent } from '../types';
import { ApiEventStore } from '../store/api-event-store';
export declare function initApiEventStore(store: ApiEventStore): void;
export declare function emit(event: OrchestratorEvent): void;
export declare function log(message: string): void;
export declare function logError(message: string, error?: unknown): void;
