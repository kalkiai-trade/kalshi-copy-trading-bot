import { OrdersApi, type Fill } from "kalshi-typescript";
import {
  COPY_DRY_RUN,
  COPY_MAX_CONTRACTS,
  COPY_SIZE_MULTIPLIER,
} from "./env";
import { createLogger } from "./logger";
import { withBackoff } from "./backoff";

const log = createLogger("mirror");

export function dollarsToLimitCents(side: "yes" | "no", fill: Fill): number {
  const raw =
    side === "yes" ? fill.yes_price_dollars : fill.no_price_dollars;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return 50;
  return Math.max(1, Math.min(99, Math.round(n * 100)));
}

export function scaledContractCount(fill: Fill): number {
  const base = Number.parseFloat(fill.count_fp ?? "1");
  if (Number.isNaN(base) || base <= 0) return 1;
  const scaled = Math.round(base * COPY_SIZE_MULTIPLIER);
  return Math.max(1, Math.min(COPY_MAX_CONTRACTS, scaled));
}

export async function mirrorFillToFollower(
  orders: OrdersApi,
  fill: Fill
): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const ticker = fill.ticker?.trim() || fill.market_ticker?.trim();
  if (!ticker) {
    return { ok: false, error: "fill missing ticker" };
  }
  const side = fill.side;
  const action = fill.action;
  const cents = dollarsToLimitCents(side, fill);
  const count = scaledContractCount(fill);

  if (COPY_DRY_RUN) {
    const msg = `[DRY RUN] mirror fill=${fill.fill_id} ${action} ${side} ${ticker} count=${count} limit≈${cents}c`;
    log.info(msg);
    return { ok: true, orderId: "dry-run" };
  }

  const clientOrderId = `copy:${fill.fill_id}`.slice(0, 64);

  try {
    const res = await withBackoff(() =>
      orders.createOrder({
        ticker,
        client_order_id: clientOrderId,
        side,
        action,
        count,
        time_in_force: "good_till_canceled",
        ...(side === "yes" ? { yes_price: cents } : { no_price: cents }),
      })
    );
    const id = res.data.order?.order_id ?? "unknown";
    log.info(
      `Mirrored fill ${fill.fill_id} → follower order ${id} ${ticker} ${action} ${side}×${count}`
    );
    return { ok: true, orderId: id };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log.error(`Mirror failed for fill ${fill.fill_id}:`, message);
    return { ok: false, error: message };
  }
}
