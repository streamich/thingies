export type Code<T = unknown> = () => Promise<T>;

/** Executes code concurrently. */
export const go = (code: Code<unknown>): void => { code().catch(() => {}) }

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
    const task = new Task(code);
    queue.add(task as Task<unknown>);
    return workers < limit && go(work), task.promise;
  };
};

/**
 * Executes only one instance of give code at a time. If other calls come in in
 * parallel, they get resolved to the result of the ongoing execution.
 */
export const codeMutex = <T>(code: Code<T>): Code<T> => {
  let result: Promise<T> | undefined;
  return async (): Promise<T> => {
    if (result) return result;
    try { return await (result = code()) }
    finally { result = undefined }
  };
};
