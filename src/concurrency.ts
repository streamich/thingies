import {go} from './go';
import type {Code} from './types';

/* tslint:disable */

class Task<T = unknown> {
  public readonly resolve!: (data: T) => void;
  public readonly reject!: (error: any) => void;
  public readonly promise = new Promise<T>((resolve, reject) => {
    (this as any).resolve = resolve;
    (this as any).reject = reject;
  });
  constructor(public readonly code: Code<T>) {}
}

/** Limits concurrency of async code. */
export const concurrency = (limit: number) => {
  // Ensure limit is a valid positive number, defaulting to 1 for invalid values
  const effectiveLimit = Math.max(1, Math.floor(Number.isFinite(limit) ? limit : 1));
  
  let workers = 0;
  const queue = new Set<Task>();
  const work = async () => {
    const task = queue.values().next().value;
    if (task) queue.delete(task);
    else return;
    workers++;
    try {
      task.resolve(await task.code());
    } catch (error) {
      task.reject(error);
    } finally {
      workers--;
      if (queue.size) go(work);
    }
  };
  return async <T = unknown>(code: Code<T>): Promise<T> => {
    const task = new Task(code);
    queue.add(task as Task<unknown>);
    if (workers < effectiveLimit) go(work);
    return task.promise;
  };
};
