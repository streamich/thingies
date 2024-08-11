export class LruMap<K, V> extends Map<K, V> {
  constructor(
    // 2^30 - 1 (a SMI in V8, for 32-bit platforms)
    public readonly limit: number = 1073741823,
  ) {
    super();
  }

  public set(key: K, value: V): this {
    super.delete(key);
    super.set(key, value);
    if (super.size > this.limit) super.delete(super.keys().next().value!);
    return this;
  }

  public get(key: K): V | undefined {
    const value = super.get(key)!;
    if (value === void 0) return super.delete(key) && super.set(key, value), value;
    super.delete(key);
    super.set(key, value);
    return value;
  }
}
