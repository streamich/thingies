import {FanOut} from './fanout';

const NO_CACHE: unique symbol = Symbol();

/** React.js synchronous state interface. */
export interface SyncStore<T> {
  subscribe: SyncStoreSubscribe;
  getSnapshot: () => T;
}
export type SyncStoreSubscribe = (callback: () => void) => SyncStoreUnsubscribe;
export type SyncStoreUnsubscribe = () => void;

export type SyncDep<T> = SyncValue<T> & SyncStore<T> & FanOut<void>;

export type WrapListInSyncDep<T extends unknown[]> = {
  [K in keyof T]: SyncDep<T[K]>;
};

export interface Disposable {
  dispose(): void;
}

export interface SyncValue<T> {
  value: T;
}

export class Value<V> extends FanOut<void> implements SyncStore<V>, SyncValue<V> {
  constructor(value: V) {
    super();
    this.value = value;
  }

  public next(value: V, force = false): void {
    if (!force && this.value === value) return;
    this.value = value;
    this.emit();
  }

  /** ----------------------------------------------------- {@link SyncValue} */

  public value: V;

  /** ----------------------------------------------------- {@link SyncStore} */

  public readonly subscribe: SyncStoreSubscribe = (cb) => this.listen(cb);
  public readonly getSnapshot: () => V = () => this.value;
}

export class Computed<N, V extends unknown[] = any>
  extends FanOut<void>
  implements SyncValue<N>, SyncStore<N>, Disposable
{
  private cache: N | typeof NO_CACHE = NO_CACHE;
  private subs: SyncStoreUnsubscribe[];

  constructor(
    protected readonly deps: WrapListInSyncDep<V>,
    protected readonly compute: (args: V) => N,
  ) {
    super();
    const subs = (this.subs = [] as SyncStoreUnsubscribe[]);
    const length = deps.length;
    for (let i = 0; i < length; i++) {
      const dep = deps[i];
      const sub = dep.listen(() => {
        this.cache = NO_CACHE;
        this.emit();
      });
      subs.push(sub);
    }
  }

  private _comp(): N {
    const cached = this.cache;
    if (cached !== NO_CACHE) return cached;
    return (this.cache = this.compute(this.deps.map((dep) => dep.getSnapshot()) as V));
  }

  /** ----------------------------------------------------- {@link SyncValue} */

  public get value(): N {
    return this._comp();
  }

  /** ----------------------------------------------------- {@link SyncStore} */

  public readonly subscribe: SyncStoreSubscribe = (cb) => this.listen(cb);
  public readonly getSnapshot: () => N = () => this._comp();

  /** ---------------------------------------------------- {@link Disposable} */

  public dispose() {
    for (const sub of this.subs) sub();
  }
}

export const val = <V>(initial: V): Value<V> => new Value(initial);
export const comp = <V extends unknown[], N>(deps: WrapListInSyncDep<V>, compute: (args: V) => N): Computed<N, V> =>
  new Computed(deps, compute);
