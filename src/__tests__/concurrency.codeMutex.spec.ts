import {codeMutex} from '../concurrency';
import {tick} from '../tick';

test('can execute code sequentially', async () => {
  const mutex = codeMutex();
  const code = async () => 123;
  const code2 = async () => mutex(code);
  expect(await code2()).toBe(123);
  expect(await code2()).toBe(123);
});

test('executing code in parallel results in one execution of the code', async () => {
  let cnt = 0;
  const mutex = codeMutex();
  const code = async () => cnt++;
  const code2 = async () => mutex(code);
  const res = await Promise.all([
    code2(),
    code2(),
    code2(),
  ]);
  expect(res).toStrictEqual([0, 0, 0]);
  const res2 = await Promise.all([
    code2(),
    code2(),
    code2(),
    code2(),
  ]);
  expect(res2).toStrictEqual([1, 1, 1, 1]);
  const res3 = await Promise.all([
    code2(),
    code2(),
  ]);
  expect(res3).toStrictEqual([2, 2]);
  const res4 = await code2();
  expect(res4).toStrictEqual(3);
});

test('can limit concurrency of a part of a function', async () => {
  const mutex = codeMutex();
  const code = async () => {
    return await mutex(async () => Math.random());
  };
  const res = await Promise.all([
    code(),
    code(),
    code(),
  ]);
  expect(res[0]).not.toBe(0);
  expect(res[0]).toBe(res[1]);
  expect(res[1]).toBe(res[2]);
});

test('can limit concurrency of a part of a function - 2', async () => {
  const mutex = codeMutex();
  let inside = 0;
  const assert = async () => {
    if (inside > 1) throw new Error('More than one execution at a time');
  };
  const code = async () => {
    await assert();
    await tick(Math.round(Math.random() * 30));
    await assert();
    return await mutex(async () => {
      inside++;
      await assert();
      await tick(Math.round(Math.random() * 30));
      await assert();
      inside--;
    });
  };
  await Promise.all([
    code(),
    code(),
    code(),
    code(),
    code(),
    code(),
    code(),
    code(),
  ]);
});

test('passes through errors', async () => {
  const mutex = codeMutex();
  const code = async () => {
    return await mutex(async () => {
      throw 123;
    });
  };
  try {
    await code();
    throw 456;
  } catch (error) {
    expect(error).toBe(123);
  }
});
