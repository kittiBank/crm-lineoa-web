const inflightRequests = new Map<string, Promise<unknown>>();
const recentResults = new Map<string, { value: unknown; expiresAt: number }>();

/** Covers layout hydrate + React Strict Mode remounts that fire GET twice. */
export const REMOUNT_DEDUPE_TTL_MS = 1500;

type DedupeOptions = {
  ttlMs?: number;
  force?: boolean;
};

/**
 * Share an in-flight async call by key so React Strict Mode remounts
 * (and other near-simultaneous callers) reuse one network request.
 * Optional ttlMs also reuses the last successful result for a short window.
 */
export function dedupeAsync<T>(
  key: string,
  factory: () => Promise<T>,
  options?: DedupeOptions,
): Promise<T> {
  const ttlMs = options?.ttlMs ?? 0;
  const force = options?.force ?? false;

  if (!force && ttlMs > 0) {
    const recent = recentResults.get(key);
    if (recent && recent.expiresAt > Date.now()) {
      return Promise.resolve(recent.value as T);
    }
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = factory()
    .then((value) => {
      if (ttlMs > 0) {
        recentResults.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
      }
      return value;
    })
    .finally(() => {
      if (inflightRequests.get(key) === promise) {
        inflightRequests.delete(key);
      }
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function invalidateDedupe(key: string) {
  inflightRequests.delete(key);
  recentResults.delete(key);
}
