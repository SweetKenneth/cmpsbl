const store = new Map<string, any>();

export function wrapState<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    const result = targetFn.apply(this, args);
    store.set(primitiveName, result);
    return result;
  } as T;
}

export function getState(key: string) {
  return store.get(key);
}
