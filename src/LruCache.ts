export class LruCache<V> {
  protected capacity: number;
  protected head: LruNode<V> | undefined = undefined;
  protected tail: LruNode<V> | undefined = undefined;
  protected map: Record<string, LruNode<V>> = Object.create(null);

  constructor(protected readonly limit: number = 1000) {
    this.capacity = limit | 0;
  }

  public get size(): number {
    return this.limit - this.capacity;
  }

  public set(key: string, value: V) {
    const node = this.map[key];
    if (node) {
      this.pop(node);
      node.v = value;
      this.push(node);
    } else {
      if (!this.capacity) {
        const head = this.head;
        if (head) {
          this.pop(head);
          delete this.map[head.k];
          this.capacity++;
        }
      }
      this.capacity--;
      const node = new LruNode(key, value);
      this.map[key] = node;
      this.push(node);
    }
  }

  public get(key: string): V | undefined {
    const node = this.map[key];
    if (!node) return;
    if (this.tail !== node) {
      this.pop(node);
      this.push(node);
    }
    return node.v;
  }

  public peek(key: string): V | undefined {
    const node = this.map[key];
    return node instanceof LruNode ? node.v : undefined;
  }

  public has(key: string): boolean {
    return key in this.map;
  }

  public clear(): void {
    this.head = undefined;
    this.tail = undefined;
    this.map = Object.create(null);
    this.capacity = this.limit;
  }

  public keys(): string[] {
    return Object.keys(this.map);
  }

  public del(key: string): boolean {
    const node = this.map[key];
    if (node instanceof LruNode) {
      this.pop(node);
      delete this.map[key];
      ++this.capacity;
      return true;
    }
    return false;
  }

  protected pop(node: LruNode<V>): void {
    const l = node.l;
    const r = node.r;
    if (this.head === node) this.head = r; else l!.r = r;
    if (this.tail === node) this.tail = l; else r!.l = l;
    // node.l = undefined;
    // node.r = undefined;
  }

  protected push(node: LruNode<V>): void {
    const tail = this.tail;
    if (tail) {
      tail.r = node;
      node.l = tail;
    } else this.head = node;
    this.tail = node;
  }
}

class LruNode<V> {
  public l: LruNode<V> | undefined = undefined;
  public r: LruNode<V> | undefined = undefined;

  constructor(
    public readonly k: string,
    public v: V,
  ) {}
}
