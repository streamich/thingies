import {concurrency as _concurrency} from './concurrency';

/**
 * A class method decorator that limits the concurrency of the method to the
 * given number of parallel executions. All invocations are queued and executed
 * in the order they were called.
 */
export function concurrency<This, Args extends any[], Return>(limit: number) {
  return (
    target: (this: This, ...args: Args) => Promise<Return>,
    context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) => {
    const limiter = _concurrency(limit);
    return async function (this: This, ...args: Args): Promise<Return> {
      return limiter(async () => await target.call(this, ...args));
    };
  };
};
