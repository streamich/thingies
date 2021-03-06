import {Defer} from '../Defer';

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

describe('new Defer()', () => {
  test('has .promise Promise object', () => {
    expect(new Defer().promise).toBeInstanceOf(Promise);
  });

  test('has .resolve() method', () => {
    expect(typeof new Defer().resolve).toBe('function');
  });

  test('has .reject() method', () => {
    expect(typeof new Defer().reject).toBe('function');
  });

  test('resolves promise when .reject() is called', async () => {
    const defer = new Defer<number>();
    const then = jest.fn();
    defer.promise.then(then);

    await tick();
    expect(then).toHaveBeenCalledTimes(0);

    defer.resolve(123);

    await tick();
    expect(then).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledWith(123);
  });

  test('rejects promise when .reject() is called', async () => {
    const defer = new Defer<number>();
    const then = jest.fn();
    const spy = jest.fn();
    defer.promise.then(then).catch(spy);

    await tick();
    expect(then).toHaveBeenCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(0);

    defer.reject('oops');

    await tick();
    expect(then).toHaveBeenCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('oops');
  });
});
