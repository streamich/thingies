import {Cache} from '../Cache';

describe('Cache', () => {
  test('can instantiate', () => {
    // tslint:disable-next-line no-unused-expression
    new Cache();
  });

  test('fetches record for the first time from origin', async () => {
    const cache = new Cache();
    const spy = jest.fn(() => Promise.resolve('foo'));
    cache.method = spy as () => Promise<string>;

    expect(spy).toHaveBeenCalledTimes(0);

    const result = await cache.get('123');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('123');
    expect(result).toBe(result);
  });

  test('fetches item from origin only on first request', async () => {
    const cache = new Cache();
    const spy = jest.fn(() => Promise.resolve('foo'));
    cache.method = spy as () => Promise<string>;

    const result1 = await cache.get('123');
    const result2 = await cache.get('123');
    const result3 = await cache.get('123');

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('different cache keys create new requests', async () => {
    const cache = new Cache();
    const spy = jest.fn(() => Promise.resolve('foo'));
    cache.method = spy as () => Promise<string>;

    const result1 = await cache.get('123');
    const result2 = await cache.get('3434');
    const result3 = await cache.get('123');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('123');
    expect(spy).toHaveBeenCalledWith('3434');
  });

  test('after retiring cache item, requests it from origin on next request', async () => {
    const cache = new Cache();
    let id = 1;
    const spy = jest.fn(() => Promise.resolve('foo' + id++));
    cache.method = spy as () => Promise<string>;

    const result1 = await cache.get('123');
    const result2 = await cache.get('123');

    cache.retire('123');

    const result3 = await cache.get('123');

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result1).toBe('foo1');
    expect(result2).toBe('foo1');
    expect(result3).toBe('foo2');
  });

  test('after TTL still returns stale data until eviction time', async () => {
    const cache = new Cache();
    cache.ttl = 100;
    cache.evictionTime = 1000;
    let id = 1;
    const spy = jest.fn(() => Promise.resolve('foo' + id++));
    cache.method = spy as () => Promise<string>;

    const result1 = await cache.get('123');
    const result2 = await cache.get('123');
    const result3 = await cache.get('123');

    expect(spy).toHaveBeenCalledTimes(1);

    await new Promise((r) => setTimeout(r, 101));

    const result4 = await cache.get('123');
    await new Promise((r) => setTimeout(r, 1));

    expect(spy).toHaveBeenCalledTimes(2);
    const result5 = await cache.get('123');
    expect(spy).toHaveBeenCalledTimes(2);

    expect(result1).toBe('foo1');
    expect(result2).toBe('foo1');
    expect(result3).toBe('foo1');
    expect(result4).toBe('foo1');
    expect(result5).toBe('foo2');
  });
});
