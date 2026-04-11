export function wrapExecution<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    try {
      return targetFn.apply(this, args);
    } catch (e) {
      return targetFn.apply(this, args);
    }
  } as T;
}
