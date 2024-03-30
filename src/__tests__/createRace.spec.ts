import {createRace} from '../createRace';

test('can execute two functions sequentially', () => {
  const race = createRace();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  race(() => {
    fn1();
  });
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(0);
  race(() => {
    fn2();
  });
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(1);
});

test('concurrently executes only the first function', () => {
  const race = createRace();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  race(() => {
    fn1();
    race(() => {
      fn2();
    });
  });
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(0);
});

test('returns result of the function', () => {
  const race = createRace();
  const fn1 = jest.fn(() => 1);
  const fn2 = jest.fn(() => 2);
  expect(fn1).toHaveBeenCalledTimes(0);
  expect(fn2).toHaveBeenCalledTimes(0);
  const res = race(() => {
    race(() => {
      return fn2();
    });
    return fn1();
  });
  expect(fn1).toHaveBeenCalledTimes(1);
  expect(fn2).toHaveBeenCalledTimes(0);
  expect(res).toBe(1);
});
