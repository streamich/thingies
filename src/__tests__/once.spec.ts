import {once} from '../once';

test('limits function invocation to one time only an memoizes the first result', async () => {
  let executions = 0;
  class A {
    @once
    test(value: number) {
      executions++;
      return value;
    }
  }
  const a = new A();
  expect(a.test(123)).toBe(123);
  expect(a.test(1)).toBe(123);
  expect(a.test(2)).toBe(123);
  expect(executions).toBe(1);
});
