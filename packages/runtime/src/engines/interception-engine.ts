export function wrapInterception<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    if (args.some(a => typeof a === 'string' && a.includes('alert('))) {
      throw new Error(`[${primitiveName}] blocked suspicious input`);
    }
    return targetFn.apply(this, args);
  } as T;
}
