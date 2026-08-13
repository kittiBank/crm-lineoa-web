const inflightRequests = new Map<string, Promise<unknown>>();

/**
 * Share an in-flight async call by key so React Strict Mode remounts
 * (and other near-simultaneous callers) reuse one network request.
 */
export function dedupeAsync<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = factory().finally(() => {
    if (inflightRequests.get(key) === promise) {
      inflightRequests.delete(key);
    }
  });

  inflightRequests.set(key, promise);
  return promise;
}
