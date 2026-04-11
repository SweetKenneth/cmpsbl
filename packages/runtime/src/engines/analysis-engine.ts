export function wrapAnalysis<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    const start = Date.now();
    const result = targetFn.apply(this, args);
    const duration = Date.now() - start;
    console.log(`[${primitiveName}] execution time: ${duration}ms`);
    return result;
  } as T;
}
