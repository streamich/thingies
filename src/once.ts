/**
 * A class method decorator that limits a method to be called only once. All
 * subsequent calls will return the result of the first call.
 */
export function once<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>,
) {
  let called = false;
  let res: unknown;
  return function (this: This, ...args: Args): Return {
    if (!called) {
      called = true;
      res = target.call(this, ...args);
    }
    return res as Return;
  };
}
