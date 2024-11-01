let id = 0;

export function debug<This, Args extends any[], Return>(name?: string) {
  return (
    fn: (this: This, ...args: Args) => Promise<Return>,
    context?: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      return async function (this: This, ...args: Args): Promise<Return> {
        id++;
        const idStr = id.toString(36);
        const currentName =
          name ?? (this ? this.constructor?.name + '.' : '') + (String(context?.name) ?? fn.name ?? 'anonymous');
        console.log('%cRUN', 'background:white;color:blue', idStr, currentName, ...args);
        try {
          const res = await fn.apply(this, args);
          console.log('%cSUC', 'background:green;color:white', idStr, currentName, res);
          return res;
        } catch (err) {
          console.log('%cERR', 'background:red;color:white', idStr, currentName, err);
          throw err;
        }
      };
    }
    return fn;
  };
}
