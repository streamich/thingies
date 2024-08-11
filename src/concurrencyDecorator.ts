import {concurrency as _concurrency} from './concurrency';

/* tslint:disable no-invalid-this */

const instances = new WeakMap<any, WeakMap<any, any>>();

/**
 * A class method decorator that limits the concurrency of the method to the
 * given number of parallel executions. All invocations are queued and executed
 * in the order they were called.
 */
export function concurrency<This, Args extends any[], Return>(limit: number) {
  return (
    fn: (this: This, ...args: Args) => Promise<Return>,
    context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) => {
    return async function (this: This, ...args: Args): Promise<Return> {
      let map = instances.get(this);
      if (!map) instances.set(this, (map = new WeakMap<any, any>()));
      if (!map.has(fn)) map.set(fn, _concurrency(limit));
      return map.get(fn)!(async () => await fn.call(this, ...args));
    };
  };
}
