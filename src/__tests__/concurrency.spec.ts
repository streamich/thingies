import {concurrency} from '../concurrency';
import {tick} from '../tick';

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
  await Promise.all([limit1(create(1)), limit1(create(2))]);
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

describe('limits concurrency to 1', () => {
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

describe('check concurrency in-flight', () => {
  for (let limit = 1; limit <= 6; limit++) {
    describe(`limits concurrency to ${limit}`, () => {
      for (let i = 0; i < 10; i++) {
        test(`${i + 1}`, async () => {
          const limiter = concurrency(limit);
          const running: boolean[] = [];
          const assert = async () => {
            const count = running.filter(Boolean).length;
            if (count > limit) throw new Error('Too many running');
          };
          const create = (index: number) => {
            running[index] = false;
            return async () => {
              running[index] = true;
              await assert();
              await tick(Math.round(Math.random() * 10) + 1);
              await assert();
              running[index] = false;
            };
          };
          const promises: Promise<any>[] = [];
          for (let i = 0; i < limit * 2; i++) {
            promises.push(limiter(create(i)));
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
          const limiter = concurrency(limit);
          let expectedIndex: number = 0;
          const create = (index: number) => {
            return async () => {
              if (index !== expectedIndex) throw new Error('Wrong order');
              expectedIndex++;
              await tick(Math.round(Math.random() * 10) + 1);
            };
          };
          const promises: Promise<any>[] = [];
          for (let i = 0; i < limit * 2; i++) {
            promises.push(limiter(create(i)));
          }
          await Promise.all(promises);
        });
      }
    });
  }
});

describe('edge cases and error handling', () => {
  test('handles invalid limit values', () => {
    // Test with limit 0 - should normalize to 1
    expect(() => concurrency(0)).not.toThrow();
    
    // Test with negative limit - should normalize to 1
    expect(() => concurrency(-1)).not.toThrow();
    
    // Test with non-integer limit - should floor to integer
    expect(() => concurrency(2.5)).not.toThrow();
    
    // Test with NaN - should normalize to 1
    expect(() => concurrency(NaN)).not.toThrow();
    
    // Test with Infinity - should normalize to 1
    expect(() => concurrency(Infinity)).not.toThrow();
    
    // Test with -Infinity - should normalize to 1
    expect(() => concurrency(-Infinity)).not.toThrow();
  });

  test('normalizes invalid limits to minimum of 1', async () => {
    const testLimits = [0, -1, -10, NaN, -Infinity];
    
    for (const limit of testLimits) {
      const limiter = concurrency(limit);
      const res: number[] = [];
      const start = Date.now();
      
      // Run tasks that should complete in sequence (limit 1 behavior)
      await Promise.all([
        limiter(async () => { await tick(10); res.push(1); }),
        limiter(async () => { await tick(10); res.push(2); }),
      ]);
      
      const duration = Date.now() - start;
      expect(res).toEqual([1, 2]);
      // Should take at least 20ms (2 tasks * 10ms each) if running in sequence
      expect(duration).toBeGreaterThan(15);
    }
  });

  test('handles non-integer limits by flooring', async () => {
    const limitFloat = concurrency(2.7);
    const res: number[] = [];
    let activeCount = 0;
    let maxActive = 0;
    
    const task = async () => {
      activeCount++;
      maxActive = Math.max(maxActive, activeCount);
      await tick(10);
      activeCount--;
      res.push(1);
    };
    
    await Promise.all([
      limitFloat(task),
      limitFloat(task),
      limitFloat(task),
      limitFloat(task),
    ]);
    
    expect(res).toHaveLength(4);
    expect(maxActive).toBe(2); // Should floor 2.7 to 2
  });

  test('handles zero limit gracefully', async () => {
    const limit0 = concurrency(0);
    const res: number[] = [];
    const create = (value: number) => async () => {
      res.push(value);
    };
    
    // With limit 0 (normalized to 1), tasks should execute with concurrency of 1
    await limit0(create(1));
    expect(res).toStrictEqual([1]);
    
    await limit0(create(2));
    expect(res).toStrictEqual([1, 2]);
    
    // Test concurrent execution - should still be limited to 1
    await Promise.all([limit0(create(3)), limit0(create(4))]);
    expect(res).toStrictEqual([1, 2, 3, 4]);
  });

  test('handles negative limit gracefully', async () => {
    const limitNeg = concurrency(-1);
    const res: number[] = [];
    const create = (value: number) => async () => {
      res.push(value);
    };
    
    // With negative limit (normalized to 1), tasks should execute with concurrency of 1
    await limitNeg(create(1));
    expect(res).toStrictEqual([1]);
    
    // Test concurrent execution - should still be limited to 1
    await Promise.all([limitNeg(create(2)), limitNeg(create(3))]);
    expect(res).toStrictEqual([1, 2, 3]);
  });

  test('propagates errors correctly', async () => {
    const limit1 = concurrency(1);
    const error = new Error('Test error');
    
    const throwingTask = async () => {
      throw error;
    };
    
    // Error should be propagated
    await expect(limit1(throwingTask)).rejects.toBe(error);
    
    // Limiter should continue working after error
    const res: number[] = [];
    const normalTask = async () => {
      res.push(42);
    };
    
    await limit1(normalTask);
    expect(res).toStrictEqual([42]);
  });

  test('errors do not affect other tasks', async () => {
    const limit2 = concurrency(2);
    const res: number[] = [];
    const error = new Error('Test error');
    
    const normalTask = (value: number) => async () => {
      await tick(10);
      res.push(value);
    };
    
    const throwingTask = async () => {
      await tick(5);
      throw error;
    };
    
    const promises = [
      limit2(normalTask(1)),
      limit2(throwingTask),
      limit2(normalTask(2)),
    ];
    
    // One promise should reject, others should resolve
    const results = await Promise.allSettled(promises);
    
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[2].status).toBe('fulfilled');
    
    expect(res).toEqual(expect.arrayContaining([1, 2]));
  });

  test('handles many concurrent tasks efficiently', async () => {
    const limit = 5;
    const limiter = concurrency(limit);
    const taskCount = 100;
    const res: number[] = [];
    
    const create = (value: number) => async () => {
      await tick(1);
      res.push(value);
    };
    
    const promises = [];
    for (let i = 0; i < taskCount; i++) {
      promises.push(limiter(create(i)));
    }
    
    await Promise.all(promises);
    
    expect(res).toHaveLength(taskCount);
    expect(res.sort((a, b) => a - b)).toEqual(Array.from({length: taskCount}, (_, i) => i));
  });

  test('handles immediately completing tasks', async () => {
    const limit3 = concurrency(3);
    const res: number[] = [];
    
    // Tasks that complete immediately (synchronously)
    const immediateTask = (value: number) => async () => {
      res.push(value);
      // No await, completes immediately
    };
    
    await Promise.all([
      limit3(immediateTask(1)),
      limit3(immediateTask(2)),
      limit3(immediateTask(3)),
      limit3(immediateTask(4)),
      limit3(immediateTask(5)),
    ]);
    
    expect(res).toHaveLength(5);
    expect(res).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  test('handles very large limit', async () => {
    const largeLimit = concurrency(1000);
    const taskCount = 10;
    const res: number[] = [];
    
    const create = (value: number) => async () => {
      res.push(value);
    };
    
    const promises = [];
    for (let i = 0; i < taskCount; i++) {
      promises.push(largeLimit(create(i)));
    }
    
    await Promise.all(promises);
    
    expect(res).toHaveLength(taskCount);
  });

  test('handles empty task queue', async () => {
    const limiter = concurrency(5);
    // Just creating the limiter without adding tasks should not cause issues
    expect(limiter).toBeDefined();
    
    // Adding a task after creation should work
    const res: number[] = [];
    await limiter(async () => {
      res.push(1);
    });
    expect(res).toStrictEqual([1]);
  });

  test('tasks maintain proper scope and context', async () => {
    const limiter = concurrency(2);
    
    class TestContext {
      value = 0;
      
      async increment() {
        await tick(5);
        this.value++;
        return this.value;
      }
    }
    
    const context = new TestContext();
    
    const results = await Promise.all([
      limiter(() => context.increment()),
      limiter(() => context.increment()),
      limiter(() => context.increment()),
    ]);
    
    expect(results).toEqual([1, 2, 3]);
    expect(context.value).toBe(3);
  });
});
