import {concurrency} from '../concurrency';
import {tick} from '../tick';

describe('limits concurrency to one-at-a-time', () => {
  for (let i = 0; i < 10; i++) {
    test(`${i + 1}`, async () => {
      const limit1 = concurrency(1);
      const res: number[] = [];
      const create = (value: number) => async () => {
        await tick(Math.round(Math.random() * 10) + 1);
        res.push(value);
      };
      await Promise.all([
        limit1(create(1)),
        limit1(create(2)),
        limit1(create(3)),
        limit1(create(4)),
        limit1(create(5)),
      ]);
      expect(res).toStrictEqual([1, 2, 3, 4, 5]);
    });
  }
});

test('can execute one function with limit 1', async () => {
  const limit1 = concurrency(1);
  const res: number[] = [];
  const create = (value: number) => async () => {
    res.push(value);
  };
  await limit1(create(123));
  expect(res).toStrictEqual([123]);
  await limit1(create(456));
  expect(res).toStrictEqual([123, 456]);
  await Promise.all([
    limit1(create(1)),
    limit1(create(2)),
  ]);
  expect(res).toStrictEqual([123, 456, 1, 2]);
});

test('can execute one function with limit 10', async () => {
  const limit10 = concurrency(10);
  const res: number[] = [];
  const create = (value: number) => async () => {
    res.push(value);
  };
  await limit10(create(123));
  expect(res).toStrictEqual([123]);
  await limit10(create(456));
  expect(res).toStrictEqual([123, 456]);
  await Promise.all([limit10(create(1))]);
  expect(res).toStrictEqual([123, 456, 1]);
});
