/**
 * A class method decorator that limits a method to be called only once. All
 * subsequent calls will return the result of the first call.
 */
export function once<This, Args extends any[], Return>(
  fn: (this: This, ...args: Args) => Return,
  context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  const instances = new WeakMap<any, WeakMap<any, any>>();
  return function (this: This, ...args: Args): Return {
    if (!instances.has(this)) instances.set(this, new WeakMap<any, any>());
    const map = instances.get(this)!;
    if (!map.has(fn)) map.set(fn, fn.apply(this, args));
    return map.get(fn);
  };
}
