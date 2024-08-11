import {timeout} from '../timeout';
import {tick} from '../tick';

test('returns result of the function', async () => {
  const res = await timeout(1000, async () => 123);
  expect(res).toBe(123);
});

test('returns result of the function - 2', async () => {
  const res = await timeout(1000, async () => {
    await tick(15);
    return '123';
  });
  expect(res).toBe('123');
});

test('returns result of the promise', async () => {
  const promise = (async () => {
    await tick(15);
    return '123';
  })();
  const res = await timeout(1000, promise);
  expect(res).toBe('123');
});

test('throws TIMEOUT when running longer than timeout time', async () => {
  const start = Date.now();
  try {
    await timeout(20, async () => {
      await tick(500);
      return '123';
    });
    throw new Error('not this');
  } catch (error) {
    expect(error).toEqual(new Error('TIMEOUT'));
    const end = Date.now();
    expect(end - start < 100).toBe(true);
  }
});
