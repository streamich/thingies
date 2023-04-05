import {Defer} from "./Defer";

export type Code<T = unknown> = () => Promise<T>;

/** Executes code concurrently. */
export const go = (code: Code<unknown>): void => { code().catch(() => {}); }

class Task<T = unknown> extends Defer<T> {
  constructor(public readonly code: Code<T>) { super(); }
}

/** Limits concurrency of async code. */
export const concurrency = (limit: number) => {
  let workers = 0;
  const queue = new Set<Task>();
  const work = async () => {
    const task = queue.values().next().value;
    if (task) queue.delete(task); else return;
    workers++;
    try { task.resolve(await task.code()) }
    catch (error) { task.reject(error) }
    finally { workers--, queue.size && go(work) }
  };
  return async <T = unknown>(code: Code<T>): Promise<T> => {
    const task = new Task<T>(code);
    queue.add(task as Task<unknown>);
    return workers < limit && go(work), task.promise;
  };
};
