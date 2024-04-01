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
    await tick(21);
    expect(locks.isLocked('my-lock')).toBe(false);
    const unlock2 = locks.acquire('my-lock', 1);
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
