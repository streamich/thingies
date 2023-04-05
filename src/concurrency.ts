import {Defer} from "./Defer";

export type Code<T = unknown> = () => Promise<T>;

/** Executes code concurrently. */
export const go = (code: Code<unknown>): void => { code().catch(() => {}); }

class Task<T = unknown> extends Defer<T> {
  constructor(public readonly code: Code<T>) { super(); }
}

/** Limits concurrency of async code. */
export const concurrency = (limit: number) => {
  let count = 0;
  const queue: Task<any>[] = [];
  const loop = async () => {
    const task = queue.shift();
    if (!task) return; else count++;
    try { task.resolve(await task.code()) }
    catch (error) { task.reject(error) }
    finally { count--, queue.length && go(loop) }
  };
  return async <T = unknown>(code: Code<T>): Promise<T> => {
    const task = new Task<T>(code);
    queue.push(task);
    if (count < limit) go(loop);
    return task.promise;
  };
};
