/**
 * Sleep with optional exponential backoff for transient Kalshi / network errors.
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; baseMs?: number } = {}
): Promise<T> {
  const attempts = opts.attempts ?? 4;
  const baseMs = opts.baseMs ?? 400;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i === attempts - 1) break;
      await sleep(baseMs * Math.pow(2, i));
    }
  }
  throw last;
}
