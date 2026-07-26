import {LruTtlMap} from '../LruTtlMap';

/** Size of the internal expiry side-map, which should never outgrow the map itself. */
const expirySize = (lru: LruTtlMap<any, any>): number => (lru as any).expiry.size;

describe('LruTtlMap', () => {
  test('.get() / .set() / .size', () => {
    const lru = new LruTtlMap(123);
    lru.set('foo', 1);
    expect(lru.size).toBe(1);
    lru.set('bar', 2);
    expect(lru.get('foo')).toBe(1);
    expect(lru.get('bar')).toBe(2);
    expect(lru.size).toBe(2);
  });

  test('keeps limit', () => {
    const lru = new LruTtlMap(2);
    lru.set('1', 1);
    expect(lru.size).toBe(1);
    lru.set('2', 2);
    expect(lru.size).toBe(2);
    lru.set('3', 3);
    expect(lru.size).toBe(2);
    lru.set('4', 4);
    expect(lru.size).toBe(2);
    expect(lru.get('1')).toBe(undefined);
    expect(lru.get('2')).toBe(undefined);
    expect(lru.get('3')).toBe(3);
    expect(lru.get('4')).toBe(4);
  });

  test('rotates keys on .get()', () => {
    const lru = new LruTtlMap(3);
    lru.set('1', 1);
    expect(lru.size).toBe(1);
    lru.set('2', 2);
    expect(lru.size).toBe(2);
    lru.set('3', 3);
    expect(lru.size).toBe(3);
    expect(lru.get('2')).toBe(2);
    lru.set('4', 4);
    expect(lru.size).toBe(3);
    expect(lru.get('1')).toBe(undefined);
    expect(lru.get('2')).toBe(2);
  });

  test('rotates keys on .set()', () => {
    const lru = new LruTtlMap(3);
    lru.set('1', 1);
    expect(lru.size).toBe(1);
    lru.set('2', 2);
    expect(lru.size).toBe(2);
    lru.set('3', 3);
    expect(lru.size).toBe(3);
    lru.set('2', 2);
    lru.set('4', 4);
    expect(lru.size).toBe(3);
    expect(lru.get('1')).toBe(undefined);
    expect(lru.get('2')).toBe(2);
  });

  test('Should drop key least used on max size', () => {
    const cache = new LruTtlMap(3);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.get('a')).toBe('1');
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
    cache.set('d', '4');
    expect(cache.get('d')).toBe('4');
    expect(cache.get('a')).toBe(undefined);
    cache.get('b');
    cache.set('e', '5');
    expect(cache.get('b')).toBe('2');
    expect(cache.get('e')).toBe('5');
    expect(cache.get('c')).toBe(undefined);
  });

  test('should remove all objects on reset', () => {
    const cache = new LruTtlMap(3);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.size).toBe(3);
    expect([...cache.keys()].length).toBe(3);
    cache.clear();
    expect(cache.size).toBe(0);
    expect([...cache.keys()].length).toBe(0);
  });

  test('returns a key that have not expired', () => {
    const lru = new LruTtlMap(3);
    lru.set('1', 1);
    expect(lru.get('1')).toBe(1);
    lru.set('2', 2, 10);
    expect(lru.get('2', 9)).toBe(2);
  });

  test('does not return a key that has expired', () => {
    const lru = new LruTtlMap(3);
    lru.set('1', 1);
    expect(lru.get('1', 123)).toBe(1);
    lru.set('2', 2, 10);
    expect(lru.get('2', 11)).toBe(undefined);
  });

  test('does not leak expiry entries when keys are evicted by the LRU limit', () => {
    const lru = new LruTtlMap<string, number>(4);
    const deadline = Date.now() + 100000;
    for (let i = 0; i < 1000; i++) lru.set(String(i), i, deadline);
    expect(lru.size).toBe(4);
    expect(expirySize(lru)).toBe(4);
  });

  test('does not leak expiry entries when keys are overwritten', () => {
    const lru = new LruTtlMap<string, number>(4);
    for (let i = 0; i < 100; i++) lru.set('1', i, Date.now() + 100000);
    expect(lru.size).toBe(1);
    expect(expirySize(lru)).toBe(1);
  });

  test('does not leak expiry entries when the limit is zero', () => {
    const lru = new LruTtlMap<string, number>(0);
    for (let i = 0; i < 100; i++) lru.set(String(i), i, Date.now() + 100000);
    expect(lru.size).toBe(0);
    expect(expirySize(lru)).toBe(0);
  });

  test('.clear() empties the expiry map', () => {
    const lru = new LruTtlMap<string, number>(4);
    lru.set('1', 1, Date.now() + 100000);
    lru.set('2', 2);
    lru.clear();
    expect(lru.size).toBe(0);
    expect(expirySize(lru)).toBe(0);
  });

  test('.delete() removes the expiry entry', () => {
    const lru = new LruTtlMap<string, number>(4);
    lru.set('1', 1, Date.now() + 100000);
    expect(lru.delete('1')).toBe(true);
    expect(expirySize(lru)).toBe(0);
  });

  test('expires entries when `now` is not given', () => {
    const lru = new LruTtlMap<string, boolean>(4);
    lru.set('x', true, Date.now() - 10000);
    expect(lru.has('x')).toBe(false);
    expect(lru.get('x')).toBe(undefined);
    expect(lru.size).toBe(0);
    expect(expirySize(lru)).toBe(0);
  });

  test('returns not-yet-expired entries when `now` is not given', () => {
    const lru = new LruTtlMap<string, boolean>(4);
    lru.set('x', true, Date.now() + 10000);
    expect(lru.has('x')).toBe(true);
    expect(lru.get('x')).toBe(true);
  });

  test('entries without an explicit expiry never expire', () => {
    const lru = new LruTtlMap<string, boolean>(4);
    lru.set('x', true);
    expect(lru.has('x')).toBe(true);
    expect(lru.get('x')).toBe(true);
    expect(lru.has('x', Date.now() + 1000000)).toBe(true);
  });

  test('when item accessed multiple times it keeps its expiry time', () => {
    const lru = new LruTtlMap(3);
    lru.set('1', 1);
    lru.set('2', 2, 100);
    lru.set('3', 3);
    expect(lru.get('2', 50)).toBe(2);
    lru.set('4', 4);
    expect(lru.get('2', 60)).toBe(2);
    lru.set('5', 5);
    expect(lru.get('2', 70)).toBe(2);
    lru.set('6', 6);
    expect(lru.get('2', 80)).toBe(2);
    expect(lru.size).toBe(3);
    expect(lru.get('5')).toBe(5);
    expect(lru.get('6')).toBe(6);
    expect(lru.size).toBe(3);
    expect(lru.get('2', 120)).toBe(undefined);
    expect(lru.size).toBe(2);
  });
});
