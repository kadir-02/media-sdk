
export function mergeProps<T extends Record<string, any>>(
  internal: T,
  external?: Partial<T>
): T {
  if (!external) return internal;
  const merged: Record<string, any> = { ...internal, ...external };
  for (const key of Object.keys(internal)) {
    const isHandler = key.startsWith("on") && typeof internal[key] === "function";
    const externalHandler = external[key as keyof T];
    if (isHandler && typeof externalHandler === "function") {
      merged[key] = (...args: any[]) => {
        (externalHandler as Function)(...args);
        (internal[key] as Function)(...args);
      };
    }
  }
  return merged as T;
}
