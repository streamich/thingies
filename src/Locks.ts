const defaultState = typeof window === 'object' && window && (typeof window.localStorage === 'object') ? window.localStorage : {};

/**
 * Creates a lock manager, which can create exclusive locks across browser tabs.
 * Uses `window.localStorage` by default to lock across tabs.
 * 
 * Below example, will wait for 5 seconds to acquire a lock, and then execute
 * the function once lock is acquired and release the lock after function
 * execution. It will fail with `LOCK_TIMEOUT` error if lock is not acquired
 * within the 5 seconds. The lock will acquired for 2 seconds (default 1000ms).
 * 
 * ```ts
 * const locks = new Locks();
 * 
 * locks.lock('my-lock', 2000, 5000, async () => {
 *   console.log('Lock acquired');
 * });
 * ```
 */
export class Locks {
  constructor (
    protected readonly state: Record<string, string> = defaultState,
    protected readonly now = Date.now,
    protected readonly pfx = 'lock-',
  ) {}

  public acquire(id: string, ms = 1000): boolean {
    const key = this.pfx + id;
    const lockUntil = this.state[key];
    const now = this.now();
    if (lockUntil === undefined) {
      this.state[key] = (now + ms).toString(36);
      return true;
    }
    const lockUntilNum = parseInt(lockUntil, 36);
    if (lockUntilNum > now) return false;
    const lockUntilNex = (now + ms).toString(36);
    this.state[key] = lockUntilNex;
    return true;
  }

  public release(id: string): boolean {
    const key = this.pfx + id;
    if (this.state[key] === undefined) return false;
    delete this.state[key];
    return true;
  }

  public isLocked(id: string): boolean {
    const key = this.pfx + id;
    const lockUntil = this.state[key];
    if (lockUntil === undefined) return false;
    const now = this.now();
    const lockUntilNum = parseInt(lockUntil, 36);
    return lockUntilNum > now;
  }

  public lock(id: string, ms?: number, timeoutMs: number = 2 * 1000, checkMs: number = 10): (<T>(fn: () => Promise<T>) => Promise<T>) {
    return async <T>(fn: () => Promise<T>): Promise<T> => {
      const timeout = this.now() + timeoutMs;
      while (true) {
        const acquired = this.acquire(id, ms);
        if (acquired) break;
        await new Promise(r => setTimeout(r, checkMs));
        if (this.now() > timeout) throw new Error('LOCK_TIMEOUT');
      }
      try {
        return await fn();
      } finally {
        this.release(id);
      }
    };
  }
}
