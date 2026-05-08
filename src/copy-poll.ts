import { PortfolioApi, OrdersApi, type Fill } from "kalshi-typescript";
import { COPY_POLL_LIMIT, COPY_MIN_TS, COPY_START_LOOKBACK_SEC } from "./env";
import { createLogger } from "./logger";
import { mirrorFillToFollower } from "./copy-mirror";
import { withBackoff } from "./backoff";

const log = createLogger("poll");

export type CopySession = {
  seenFillIds: Set<string>;
  minTsSec: number;
};

export function createCopySession(): CopySession {
  const now = Math.floor(Date.now() / 1000);
  const minTsSec = COPY_MIN_TS ?? now - COPY_START_LOOKBACK_SEC;
  return { seenFillIds: new Set<string>(), minTsSec };
}

export async function pollOnce(
  leaderPf: PortfolioApi,
  followerOrders: OrdersApi,
  session: CopySession
): Promise<number> {
  const res = await withBackoff(() =>
    leaderPf.getFills(
      undefined,
      undefined,
      session.minTsSec,
      undefined,
      COPY_POLL_LIMIT,
      undefined,
      undefined
    )
  );
  const fills: Fill[] = res.data?.fills ?? [];
  if (fills.length === 0) return 0;

  let mirrored = 0;
  /** API returns newest first; replay oldest first so sequencing matches fills. */
  const ordered = [...fills].reverse();

  for (const fill of ordered) {
    const id = fill.fill_id ?? fill.trade_id;
    if (!id || session.seenFillIds.has(id)) continue;
    session.seenFillIds.add(id);

    const r = await mirrorFillToFollower(followerOrders, fill);
    if (r.ok) mirrored += 1;
  }

  if (fills.length >= COPY_POLL_LIMIT) {
    log.debug(
      "Leader fill page hit poll limit; consider raising COPY_POLL_LIMIT or shortening the interval."
    );
  }

  return mirrored;
}
