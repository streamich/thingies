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

test('limits function invocation to one time for two methods', async () => {
  let aExec = 0;
  let bExec = 0;
  class A {
    @once
    a(value: number) {
      aExec++;
      return value;
    }

    @once
    b(value: number) {
      bExec++;
      return value + 1;
    }
  }
  const a = new A();
  expect(a.a(123)).toBe(123);
  expect(a.a(1)).toBe(123);
  expect(a.b(1)).toBe(2);
  expect(a.b(1)).toBe(2);
  expect(a.b(123123)).toBe(2);
  expect(a.a(2)).toBe(123);
  expect(a.a(234)).toBe(123);
  expect(aExec).toBe(1);
  expect(bExec).toBe(1);
});

test('limits function invocation to one time for two methods of two classes', async () => {
  let aExec = 0;
  let bExec = 0;
  class A {
    @once
    a(value: number) {
      aExec++;
      return value;
    }
  }
  class B {
    @once
    b(value: number) {
      bExec++;
      return value + 1;
    }
  }
  const a = new A();
  const b = new B();
  expect(a.a(123)).toBe(123);
  expect(a.a(1)).toBe(123);
  expect(b.b(1)).toBe(2);
  expect(b.b(1)).toBe(2);
  expect(b.b(123123)).toBe(2);
  expect(a.a(2)).toBe(123);
  expect(a.a(234)).toBe(123);
  expect(aExec).toBe(1);
  expect(bExec).toBe(1);
});
