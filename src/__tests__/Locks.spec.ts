import {Locks} from '../Locks';
import {tick} from '../tick';

describe('.acquire()', () => {
  test('should return true on first call', () => {
    const locks = new Locks({});
    const unlock = locks.acquire('my-lock');
    expect(unlock).toBeInstanceOf(Function);
  });

  test('should not lock on second calls', () => {
    const locks = new Locks({});
    const unlock1 = locks.acquire('my-lock');
    const unlock2 = locks.acquire('my-lock');
    const unlock3 = locks.acquire('my-lock');
    expect(!!unlock1).toBe(true);
    expect(!!unlock2).toBe(false);
    expect(!!unlock3).toBe(false);
  });

  test('can acquire lock which was released', () => {
    const locks = new Locks({});
    const unlock1 = locks.acquire('my-lock');
    unlock1!();
    const unlock2 = locks.acquire('my-lock');
    expect(!!unlock1).toBe(true);
    expect(!!unlock2).toBe(true);
  });

  test('can release lock before timeout', async () => {
    const locks = new Locks({});
    const unlock1 = locks.acquire('my-lock', 100);
    const unlock2 = locks.acquire('my-lock');
    expect(!!unlock1).toBe(true);
    expect(!!unlock2).toBe(false);
    const unlock3 = locks.acquire('my-lock');
    expect(!!unlock3).toBe(false);
    await tick(2);
    const unlock4 = locks.acquire('my-lock');
    expect(!!unlock4).toBe(false);
    unlock1!();
    const unlock5 = locks.acquire('my-lock');
    expect(!!unlock5).toBe(true);
  });

  test('cannot release other expired lock', async () => {
    const locks = new Locks({});
    const unlock1 = locks.acquire('my-lock', 20);
    expect(!!unlock1).toBe(true);
    expect(locks.isLocked('my-lock')).toBe(true);
    await tick(25);
    expect(locks.isLocked('my-lock')).toBe(false);
    const unlock2 = locks.acquire('my-lock', 10);
    expect(!!unlock2).toBe(true);
    expect(locks.isLocked('my-lock')).toBe(true);
    unlock1!();
    expect(locks.isLocked('my-lock')).toBe(true);
    expect(locks.isLocked('my-lock')).toBe(true);
    expect(locks.isLocked('my-lock')).toBe(true);
    unlock2!();
    expect(locks.isLocked('my-lock')).toBe(false);
  });
});

describe('.lock()', () => {
  test('should acquire lock', async () => {
    const locks = new Locks({});
    const fn = jest.fn();
    await locks.lock('my-lock')(async () => {
      fn();
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should acquire lock with timeout', async () => {
    const locks = new Locks({});
    const fn = jest.fn();
    locks.lock('my-lock', 50)(async () => {
      await tick(50);
    });
    await locks.lock('my-lock', 50, 100)(async () => {
      fn();
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('should throw when lock was not acquired within the specified timeout', async () => {
    const locks = new Locks({});
    locks.lock('my-lock', 10)(async () => {
      await tick(10);
    });
    try {
      await locks.lock('my-lock', 10, 5)(async () => {});
      throw new Error('Not this');
    } catch (e) {
      expect(e).toStrictEqual(new Error('LOCK_TIMEOUT'));
    }
  });

  test('should execute all code which can acquire the lock on time', async () => {
    const locks = new Locks({});
    const items: number[] = [];
    await Promise.all([
      locks.lock('my-lock', 50)(async () => {
        await tick(5);
        items.push(1);
      }),
      locks.lock('my-lock', 50, 200)(async () => {
        await tick(5);
        items.push(2);
      }),
      locks.lock('my-lock', 50, 200)(async () => {
        await tick(5);
        items.push(3);
      }),
      locks.lock('my-lock', 50, 200)(async () => {
        await tick(5);
        items.push(4);
      }),
    ]);
    expect(items).toStrictEqual([1, 2, 3, 4]);
  });
});
