export class LruMap<K, V> extends Map<K, V> {
  constructor(public readonly limit: number = Infinity) {
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
    if (value === void 0) {
      if (super.has(key)) {
        super.delete(key);
        super.set(key, value);
      }
      return;
    }
    super.delete(key);
    super.set(key, value);
    return value;
  }
}
