export type JobHandler<T = unknown> = (payload: T) => Promise<void>;

const handlers = new Map<string, JobHandler<unknown>>();

/**
 * Feature modules (automation execution, report generation, ...) call this
 * once at import time to register the job type they own. Keeping registration
 * in the feature module — not here — means this file never needs to change
 * as new job types are added.
 */
export function registerJobHandler<T>(type: string, handler: JobHandler<T>) {
  handlers.set(type, handler as JobHandler<unknown>);
}

export function getJobHandler(type: string): JobHandler<unknown> | undefined {
  return handlers.get(type);
}
