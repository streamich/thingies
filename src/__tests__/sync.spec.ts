import {Value, Computed, val, comp} from '../sync';

describe('Value', () => {
  test('can create with initial value', () => {
    const v = new Value(42);
    expect(v.value).toBe(42);
  });

  test('getSnapshot returns current value', () => {
    const v = new Value('hello');
    expect(v.getSnapshot()).toBe('hello');
  });

  test('next() updates value', () => {
    const v = new Value(1);
    v.next(2);
    expect(v.value).toBe(2);
    expect(v.getSnapshot()).toBe(2);
  });

  test('next() skips update when value is the same', () => {
    const v = new Value(1);
    const listener = jest.fn();
    v.listen(listener);
    v.next(1);
    expect(listener).not.toHaveBeenCalled();
    expect(v.value).toBe(1);
  });

  test('next() with force=true emits even when value is the same', () => {
    const v = new Value(1);
    const listener = jest.fn();
    v.listen(listener);
    v.next(1, true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(v.value).toBe(1);
  });

  test('next() emits to listeners on change', () => {
    const v = new Value(0);
    const calls: void[] = [];
    v.listen(() => calls.push(undefined));
    v.next(1);
    v.next(2);
    expect(calls.length).toBe(2);
  });

  test('subscribe returns unsubscribe function', () => {
    const v = new Value(0);
    const listener = jest.fn();
    const unsub = v.subscribe(listener);
    v.next(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    v.next(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('can hold object values', () => {
    const obj = {a: 1};
    const v = new Value(obj);
    expect(v.value).toBe(obj);
    const obj2 = {a: 2};
    v.next(obj2);
    expect(v.value).toBe(obj2);
  });

  test('can hold null and undefined values', () => {
    const v1 = new Value<null>(null);
    expect(v1.value).toBeNull();
    const v2 = new Value<undefined>(undefined);
    expect(v2.value).toBeUndefined();
  });

  test('multiple subscribers all receive notifications', () => {
    const v = new Value(0);
    const l1 = jest.fn();
    const l2 = jest.fn();
    v.subscribe(l1);
    v.subscribe(l2);
    v.next(1);
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });
});

describe('Computed', () => {
  test('computes initial value from deps', () => {
    const a = val(2);
    const b = val(3);
    const sum = new Computed([a, b], ([x, y]: [number, number]) => x + y);
    expect(sum.value).toBe(5);
  });

  test('getSnapshot returns computed value', () => {
    const a = val(10);
    const c = new Computed([a], ([x]: [number]) => x * 2);
    expect(c.getSnapshot()).toBe(20);
  });

  test('recomputes when dependency changes', () => {
    const a = val(1);
    const b = val(2);
    const sum = new Computed([a, b], ([x, y]: [number, number]) => x + y);
    expect(sum.value).toBe(3);
    a.next(10);
    expect(sum.value).toBe(12);
    b.next(20);
    expect(sum.value).toBe(30);
  });

  test('caches computed value between reads', () => {
    const a = val(5);
    const computeFn = jest.fn(([x]: [number]) => x * 2);
    const c = new Computed([a], computeFn);
    expect(c.value).toBe(10);
    expect(c.value).toBe(10);
    expect(c.getSnapshot()).toBe(10);
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  test('invalidates cache on dependency change', () => {
    const a = val(5);
    const computeFn = jest.fn(([x]: [number]) => x * 2);
    const c = new Computed([a], computeFn);
    expect(c.value).toBe(10);
    expect(computeFn).toHaveBeenCalledTimes(1);
    a.next(6);
    expect(c.value).toBe(12);
    expect(computeFn).toHaveBeenCalledTimes(2);
  });

  test('emits to listeners when dependency changes', () => {
    const a = val(1);
    const c = new Computed([a], ([x]: [number]) => x + 1);
    const listener = jest.fn();
    c.listen(listener);
    a.next(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('subscribe works for Computed', () => {
    const a = val(0);
    const c = new Computed([a], ([x]: [number]) => x);
    const listener = jest.fn();
    const unsub = c.subscribe(listener);
    a.next(1);
    expect(listener).toHaveBeenCalledTimes(1);
    unsub();
    a.next(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('dispose stops listening to deps', () => {
    const a = val(1);
    const computeFn = jest.fn(([x]: [number]) => x * 10);
    const c = new Computed([a], computeFn);
    expect(c.value).toBe(10);
    const listener = jest.fn();
    c.listen(listener);
    c.dispose();
    a.next(2);
    // After dispose, computed should not recompute or emit
    expect(listener).not.toHaveBeenCalled();
  });

  test('works with single dependency', () => {
    const a = val('hello');
    const upper = new Computed([a], ([s]: [string]) => s.toUpperCase());
    expect(upper.value).toBe('HELLO');
    a.next('world');
    expect(upper.value).toBe('WORLD');
  });

  test('works with many dependencies', () => {
    const a = val(1);
    const b = val(2);
    const c = val(3);
    const sum = new Computed([a, b, c], ([x, y, z]: [number, number, number]) => x + y + z);
    expect(sum.value).toBe(6);
    c.next(10);
    expect(sum.value).toBe(13);
  });

  test('force update on dep triggers recomputation', () => {
    const a = val(5);
    const computeFn = jest.fn(([x]: [number]) => x * 2);
    const c = new Computed([a], computeFn);
    expect(c.value).toBe(10);
    expect(computeFn).toHaveBeenCalledTimes(1);
    a.next(5, true);
    // Cache was invalidated by the emission
    expect(c.value).toBe(10);
    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});

describe('val()', () => {
  test('creates a Value instance', () => {
    const v = val(42);
    expect(v).toBeInstanceOf(Value);
    expect(v.value).toBe(42);
  });
});

describe('comp()', () => {
  test('creates a Computed instance', () => {
    const a = val(3);
    const c = comp([a], ([x]: [number]) => x * x);
    expect(c).toBeInstanceOf(Computed);
    expect(c.value).toBe(9);
  });

  test('created Computed reacts to changes', () => {
    const a = val(2);
    const b = val(3);
    const product = comp([a, b], ([x, y]: [number, number]) => x * y);
    expect(product.value).toBe(6);
    a.next(4);
    expect(product.value).toBe(12);
  });
});

describe('Computed composability', () => {
  test('Computed can depend on another Computed', () => {
    const a = val(2);
    const doubled = comp([a], ([x]: [number]) => x * 2);
    const plusOne = comp([doubled], ([x]: [number]) => x + 1);
    expect(plusOne.value).toBe(5);
    a.next(5);
    expect(doubled.value).toBe(10);
    expect(plusOne.value).toBe(11);
  });

  test('Computed can mix Value and Computed deps', () => {
    const a = val(3);
    const b = val(10);
    const doubled = comp([a], ([x]: [number]) => x * 2);
    const sum = comp([doubled, b], ([x, y]: [number, number]) => x + y);
    expect(sum.value).toBe(16);
    a.next(5);
    expect(sum.value).toBe(20);
    b.next(1);
    expect(sum.value).toBe(11);
  });

  test('deeply nested Computed chain', () => {
    const a = val(1);
    const b = comp([a], ([x]: [number]) => x + 1);
    const c = comp([b], ([x]: [number]) => x * 2);
    const d = comp([c], ([x]: [number]) => x + 10);
    expect(d.value).toBe(14); // ((1+1)*2)+10
    a.next(3);
    expect(d.value).toBe(18); // ((3+1)*2)+10
  });

  test('listeners fire through Computed chain', () => {
    const a = val(1);
    const b = comp([a], ([x]: [number]) => x * 2);
    const c = comp([b], ([x]: [number]) => x + 1);
    const listener = jest.fn();
    c.subscribe(listener);
    a.next(5);
    expect(listener).toHaveBeenCalled();
    expect(c.value).toBe(11);
  });

  test('dispose on derived Computed stops propagation', () => {
    const a = val(1);
    const b = comp([a], ([x]: [number]) => x * 2);
    const listener = jest.fn();
    b.subscribe(listener);
    b.dispose();
    a.next(2);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('sentinel cache (undefined support)', () => {
  test('Computed correctly caches undefined return value', () => {
    const a = val(1);
    const computeFn = jest.fn(([x]: [number]) => (x > 0 ? undefined : 'negative'));
    const c = comp([a], computeFn);
    expect(c.value).toBeUndefined();
    expect(c.value).toBeUndefined();
    // Should compute only once since undefined is a valid cached value
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  test('Computed correctly transitions from undefined to a value', () => {
    const a = val<number | null>(null);
    const c = comp([a], ([x]: [number | null]) => x === null ? undefined : x * 2);
    expect(c.value).toBeUndefined();
    a.next(3);
    expect(c.value).toBe(6);
  });
});
