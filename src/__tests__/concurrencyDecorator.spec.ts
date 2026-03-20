import {concurrency} from '../concurrencyDecorator';
import {tick} from '../tick';

test('can execute one function with limit 1', async () => {
  const res: number[] = [];
  class A {
    @concurrency(1)
    async create(value: number) {
      res.push(value);
    }
  }
  const a = new A();
  await a.create(123);
  expect(res).toStrictEqual([123]);
  await a.create(456);
  expect(res).toStrictEqual([123, 456]);
  await Promise.all([a.create(1), a.create(2)]);
  expect(res).toStrictEqual([123, 456, 1, 2]);
});

test('can execute one function with limit 10', async () => {
  const res: number[] = [];
  class A {
    @concurrency(10)
    async create(value: number) {
      res.push(value);
    }
  }
  const a = new A();
  await a.create(123);
  expect(res).toStrictEqual([123]);
  await a.create(456);
  expect(res).toStrictEqual([123, 456]);
  await Promise.all([a.create(1)]);
  expect(res).toStrictEqual([123, 456, 1]);
});

test(`limits concurrency separately per method`, async () => {
  const resA: number[] = [];
  const resB: number[] = [];
  class A {
    @concurrency(2)
    async a(timeout: number) {
      await tick(timeout);
      resA.push(timeout);
    }
    @concurrency(3)
    async b(timeout: number) {
      await tick(timeout);
      resB.push(timeout);
    }
  }
  const promises: Promise<any>[] = [];
  const a = new A();
  promises.push(a.a(10));
  promises.push(a.a(20));
  promises.push(a.a(100));
  promises.push(a.b(10));
  promises.push(a.b(20));
  promises.push(a.b(30));
  await tick(50);
  expect(resA).toStrictEqual([10, 20]);
  expect(resB).toStrictEqual([10, 20, 30]);
  await Promise.all(promises);
  expect(resA).toStrictEqual([10, 20, 100]);
  expect(resB).toStrictEqual([10, 20, 30]);
});

test(`limits concurrency separately per instance`, async () => {
  const resA: number[] = [];
  const resB: number[] = [];
  class A {
    constructor(protected res: number[]) {}
    @concurrency(2)
    async a(timeout: number) {
      await tick(timeout);
      this.res.push(timeout);
    }
  }
  const promises: Promise<any>[] = [];
  const a = new A(resA);
  const b = new A(resB);
  promises.push(a.a(10));
  promises.push(a.a(10));
  promises.push(a.a(100));
  promises.push(b.a(10));
  promises.push(b.a(10));
  promises.push(b.a(100));
  await tick(50);
  expect(resA).toStrictEqual([10, 10]);
  expect(resB).toStrictEqual([10, 10]);
  await Promise.all(promises);
  expect(resA).toStrictEqual([10, 10, 100]);
  expect(resB).toStrictEqual([10, 10, 100]);
});

describe('limits concurrency to 1', () => {
  for (let i = 0; i < 10; i++) {
    test(`${i + 1}`, async () => {
      const res: number[] = [];
      class A {
        @concurrency(1)
        async create(value: number) {
          await tick(Math.round(Math.random() * 10) + 1);
          res.push(value);
        }
      }
      const a = new A();
      await Promise.all([a.create(1), a.create(2), a.create(3), a.create(4), a.create(5)]);
      expect(res).toStrictEqual([1, 2, 3, 4, 5]);
    });
  }
});

describe('check concurrency in-flight', () => {
  for (let limit = 1; limit <= 6; limit++) {
    describe(`limits concurrency to ${limit}`, () => {
      for (let i = 0; i < 10; i++) {
        test(`${i + 1}`, async () => {
          const running: boolean[] = [];
          const assert = async () => {
            const count = running.filter(Boolean).length;
            if (count > limit) throw new Error('Too many running');
          };
          class A {
            @concurrency(limit)
            async create(index: number) {
              running[index] = false;
              return async () => {
                running[index] = true;
                await assert();
                await tick(Math.round(Math.random() * 10) + 1);
                await assert();
                running[index] = false;
              };
            }
          }
          const a = new A();
          const promises: Promise<any>[] = [];
          for (let i = 0; i < limit * 2; i++) {
            promises.push(a.create(i));
          }
          await Promise.all(promises);
        });
      }
    });
  }
});

describe('check execution order', () => {
  for (let limit = 1; limit <= 6; limit++) {
    describe(`limits concurrency to ${limit}`, () => {
      for (let i = 0; i < 10; i++) {
        test(`${i + 1}`, async () => {
          let expectedIndex: number = 0;
          class A {
            @concurrency(limit)
            async create(index: number) {
              return async () => {
                if (index !== expectedIndex) throw new Error('Wrong order');
                expectedIndex++;
                await tick(Math.round(Math.random() * 10) + 1);
              };
            }
          }
          const a = new A();
          const promises: Promise<any>[] = [];
          for (let i = 0; i < limit * 2; i++) {
            promises.push(a.create(i));
          }
          await Promise.all(promises);
        });
      }
    });
  }
});
