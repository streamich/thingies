import {codeMutex} from './codeMutex';

/**
 * Executes only one instance of give code at a time. For parallel calls, it
 * returns the result of the ongoing execution.
 */
export function mutex<This, Args extends any[], Return>(
  fn: (this: This, ...args: Args) => Promise<Return>,
  context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
) {
  const isDecorator = !!context;
  if (!isDecorator) {
    const mut = codeMutex<Return>();
    return async function (this: This, ...args: Args): Promise<Return> {
      return await mut(async () => await fn.call(this, ...args));
    };
  }
  const instances = new WeakMap<any, WeakMap<any, any>>();
  return async function (this: This, ...args: Args): Promise<Return> {
    let map = instances.get(this);
    if (!map) instances.set(this, map = new WeakMap<any, any>());
    if (!map.has(fn)) map.set(fn, codeMutex<Return>());
    return await map.get(fn)!(async () => await fn.call(this, ...args));
  };
}
