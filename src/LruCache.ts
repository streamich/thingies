export class LruCache<V> {
  protected head: LruNode<V> | undefined = void 0;
  protected tail: LruNode<V> | undefined = void 0;
  protected map: Record<string, LruNode<V>> = Object.create(null);
  public size = 0;

  constructor (public readonly limit: number = 1073741823) {}

  public set(key: string, value: V) {
    const node = this.map[key];
    if (node) {
      this.pop(node);
      node.v = value;
      this.push(node);
    } else {
      const size = ++this.size;
      const node = new LruNode(key, value);
      this.map[key] = node;
      this.push(node);
      if (size > this.limit) {
        const head = this.head;
        if (head instanceof LruNode) {
          this.pop(head);
          delete this.map[head.k];
          --this.size;
        }
      }
    }
  }

  public get(key: string): V | undefined {
    const node = this.map[key];
    if (node instanceof LruNode) {
      this.pop(node);
      this.push(node);
      return node.v;
    }
    return;
  }

  public peek(key: string): V | undefined {
    const node = this.map[key];
    return node instanceof LruNode ? node.v : void 0;
  }

  public has(key: string): boolean {
    return key in this.map;
  }

  public clear(): void {
    this.head = void 0;
    this.tail = void 0;
    this.map = Object.create(null);
    this.size = 0;
  }

  public keys(): string[] {
    return Object.keys(this.map);
  }

  public del(key: string): boolean {
    const node = this.map[key];
    if (node instanceof LruNode) {
      this.pop(node);
      delete this.map[key];
      --this.size;
      return true;
    }
    return false;
  }

  protected pop(node: LruNode<V>): void {
    const l = node.l;
    const r = node.r;
    if (l) l.r = r;
    if (r) r.l = l;
    if (this.head === node) this.head = r;
    if (this.tail === node) this.tail = l;
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
  public l: LruNode<V> | undefined = void 0;
  public r: LruNode<V> | undefined = void 0;

  constructor (
    public readonly k: string,
    public v: V,
  ) {}
}
