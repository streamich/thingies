const defaultStore = typeof window === 'object' && window && (typeof window.localStorage === 'object') ? window.localStorage : null;

let _locks: Locks | undefined;

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
 * Locks.get().lock('my-lock', 2000, 5000)(async () => {
 *   console.log('Lock acquired');
 * });
 * ```
 */
export class Locks {
  public static get = (): Locks => {
    if (!_locks) _locks = new Locks();
    return _locks;
  };

  constructor (
    protected readonly store: Record<string, string> = defaultStore || {},
    protected readonly now = Date.now,
    protected readonly pfx = 'lock-',
  ) {}

  public acquire(id: string, ms = 1000): (() => void) | undefined {
    if (ms <= 0) return;
    const key = this.pfx + id;
    const lockUntil = this.store[key];
    const now = this.now();
    const isLocked = lockUntil !== undefined && parseInt(lockUntil, 36) > now;
    if (isLocked) return;
    const lockUntilNex = (now + ms).toString(36);
    this.store[key] = lockUntilNex;
    const unlock = () => {
      if (this.store[key] === lockUntilNex) delete this.store[key];
    };
    return unlock;
  }

  public isLocked(id: string): boolean {
    const key = this.pfx + id;
    const lockUntil = this.store[key];
    if (lockUntil === undefined) return false;
    const now = this.now();
    const lockUntilNum = parseInt(lockUntil, 36);
    return lockUntilNum > now;
  }

  public lock(id: string, ms?: number, timeoutMs: number = 2 * 1000, checkMs: number = 10): (<T>(fn: () => Promise<T>) => Promise<T>) {
    return async <T>(fn: () => Promise<T>): Promise<T> => {
      const timeout = this.now() + timeoutMs;
      let unlock: (() => void) | undefined;
      while (!unlock) {
        unlock = this.acquire(id, ms);
        if (unlock) break;
        await new Promise(r => setTimeout(r, checkMs));
        if (this.now() > timeout) throw new Error('LOCK_TIMEOUT');
      }
      try {
        return await fn();
      } finally {
        unlock!();
      }
    };
  }
}
