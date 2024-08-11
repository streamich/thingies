import {LruMap} from '../LruMap';

describe('LruMap', () => {
  test('.get() / .set() / .size', () => {
    const lru = new LruMap(123);
    lru.set('foo', 1);
    expect(lru.size).toBe(1);
    lru.set('bar', 2);
    expect(lru.get('foo')).toBe(1);
    expect(lru.get('bar')).toBe(2);
    expect(lru.size).toBe(2);
  });

  test('keeps limit', () => {
    const lru = new LruMap(2);
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
    const lru = new LruMap(3);
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
    const lru = new LruMap(3);
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

  test('should drop key least used on max size', () => {
    const cache = new LruMap(3);
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
    const cache = new LruMap(3);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    expect(cache.size).toBe(3);
    expect([...cache.keys()].length).toBe(3);
    cache.clear();
    expect(cache.size).toBe(0);
    expect([...cache.keys()].length).toBe(0);
  });

  test('should return nothing if does not exist yet', () => {
    const cache = new LruMap(5);
    expect(cache.get('a')).toBe(undefined);
  });

  test('should return value from single set', () => {
    const cache = new LruMap(5);
    cache.set('a', 'A');
    expect(cache.get('a')).toBe('A');
  });

  test('should return value if just at capacity', () => {
    const cache = new LruMap(5);
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');
    cache.set('d', 'D');
    cache.set('e', 'E');
    expect(cache.get('e')).toBe('E');
    expect(cache.get('d')).toBe('D');
    expect(cache.get('c')).toBe('C');
    expect(cache.get('b')).toBe('B');
    expect(cache.get('a')).toBe('A');
  });

  test('should not return value just over capacity', () => {
    const cache = new LruMap(5);
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');
    cache.set('d', 'D');
    cache.set('e', 'E');
    cache.set('f', 'F');
    expect(cache.get('f')).toBe('F');
    expect(cache.get('e')).toBe('E');
    expect(cache.get('d')).toBe('D');
    expect(cache.get('c')).toBe('C');
    expect(cache.get('b')).toBe('B');
    expect(cache.get('a')).toBe(undefined);
  });

  test('should return value if get recently', () => {
    const cache = new LruMap(5);
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');
    cache.set('d', 'D');
    cache.set('e', 'E');
    expect(cache.get('a')).toBe('A');
    cache.set('f', 'F');
    expect(cache.get('f')).toBe('F');
    expect(cache.get('e')).toBe('E');
    expect(cache.get('d')).toBe('D');
    expect(cache.get('c')).toBe('C');
    expect(cache.get('a')).toBe('A');
    expect(cache.get('b')).toBe(undefined);
  });

  test('should return overwritten "a" value and remove out-of-capacity "b" item', () => {
    const cache = new LruMap(5);
    cache.set('a', 'A');
    cache.set('b', 'B');
    cache.set('c', 'C');
    cache.set('d', 'D');
    cache.set('e', 'E');
    cache.set('a', 'AA');
    cache.set('f', 'F');
    expect(cache.get('f')).toBe('F');
    expect(cache.get('e')).toBe('E');
    expect(cache.get('d')).toBe('D');
    expect(cache.get('c')).toBe('C');
    expect(cache.get('a')).toBe('AA');
    expect(cache.get('b')).toBe(undefined);
  });

  test('refreshes access time of `undefined` values', () => {
    const cache = new LruMap(3);
    cache.set('u', undefined);
    cache.set('b', 'B');
    cache.set('c', 'C');
    cache.get('u');
    cache.set('d', 'D');
    expect(cache.has('u')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('d')).toBe(true);
  });
});
