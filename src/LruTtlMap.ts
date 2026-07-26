import {LruMap} from './LruMap';

/**
 * An {@link LruMap} where each entry additionally carries an absolute expiry
 * deadline, in the same units as the `now` timestamps supplied to reads
 * (milliseconds since the Unix epoch, by default).
 */
export class LruTtlMap<K, V> extends LruMap<K, V> {
  private readonly expiry = new Map<K, number>();

  public clear(): void {
    this.expiry.clear();
    super.clear();
  }

  public delete(key: K): boolean {
    this.expiry.delete(key);
    return super.delete(key);
  }

  /**
   * @param now Current time, defaults to `Date.now()`. Entries with a deadline
   *     strictly below it are treated as missing and are removed.
   */
  public has(key: K, now: number = Date.now()): boolean {
    if (!super.has(key)) return false;
    const expiry = this.expiry.get(key) || 0;
    const expired = now > expiry;
    if (expired) this.delete(key);
    return !expired;
  }

  /**
   * @param now Current time, defaults to `Date.now()`. Entries with a deadline
   *     strictly below it are treated as missing and are removed.
   */
  public get(key: K, now?: number): V | undefined {
    if (!this.has(key, now)) return undefined;
    const value = super.get(key)!;
    super.set(key, value);
    return value;
  }

  /**
   * @param expiry Absolute deadline after which the entry expires, defaults to
   *     `Infinity` (never expires). For a relative TTL use `Date.now() + ttl`.
   */
  public set(key: K, value: V, expiry: number = Infinity): this {
    this.expiry.set(key, expiry);
    super.set(key, value);
    return this;
  }
}
