import {mutex} from '../mutex';

test('can execute code sequentially', async () => {
  const code = async () => 123;
  const code2 = mutex(code);
  expect(await code2()).toBe(123);
  expect(await code2()).toBe(123);
});

test('executing code in parallel results in one execution of the code', async () => {
  let cnt = 0;
  const code = async () => cnt++;
  const code2 = mutex(code);
  const res = await Promise.all([code2(), code2(), code2()]);
  expect(res).toStrictEqual([0, 0, 0]);
  const res2 = await Promise.all([code2(), code2(), code2(), code2()]);
  expect(res2).toStrictEqual([1, 1, 1, 1]);
  const res3 = await Promise.all([code2(), code2()]);
  expect(res3).toStrictEqual([2, 2]);
  const res4 = await code2();
  expect(res4).toStrictEqual(3);
});

test('works as a class method decorator', async () => {
  let cnt = 0;
  class Test {
    @mutex async code() {
      return cnt++;
    }
  }
  const test = new Test();
  const res = await Promise.all([test.code(), test.code(), test.code()]);
  expect(res).toStrictEqual([0, 0, 0]);
  const res2 = await Promise.all([test.code(), test.code(), test.code(), test.code()]);
  expect(res2).toStrictEqual([1, 1, 1, 1]);
  const res3 = await Promise.all([test.code(), test.code()]);
  expect(res3).toStrictEqual([2, 2]);
  const res4 = await test.code();
  expect(res4).toStrictEqual(3);
});
