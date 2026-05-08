import { OrdersApi, PortfolioApi } from "kalshi-typescript";
import {
  COPY_POLL_INTERVAL_MS,
  COPY_DRY_RUN,
} from "./env";
import {
  assertDistinctAccounts,
  assertFollowerCredentials,
  assertLeaderCredentials,
} from "./credentials";
import { createFollowerConfiguration, createLeaderConfiguration } from "./kalshi-client";
import { createCopySession, pollOnce } from "./copy-poll";
import { logVersion, rootLog } from "./logger";
import { sleep } from "./backoff";
import { installShutdownHandlers } from "./signals";

async function main(): Promise<void> {
  logVersion();
  assertFollowerCredentials();
  assertLeaderCredentials();
  assertDistinctAccounts();

  const leaderConf = createLeaderConfiguration();
  if (!leaderConf) {
    rootLog.error("Leader configuration missing.");
    process.exit(1);
  }

  const followerConf = createFollowerConfiguration();
  const leaderPf = new PortfolioApi(leaderConf);
  const followerOrders = new OrdersApi(followerConf);
  const session = createCopySession();

  rootLog.info(
    `Polling leader fills every ${COPY_POLL_INTERVAL_MS}ms; dryRun=${COPY_DRY_RUN} minTs=${session.minTsSec}`
  );

  let running = true;
  installShutdownHandlers(() => {
    running = false;
    rootLog.info("Shutdown signal received; finishing current tick.");
  });

  while (running) {
    try {
      const n = await pollOnce(leaderPf, followerOrders, session);
      if (n > 0) rootLog.info(`Mirrored ${n} new fill(s) this tick.`);
    } catch (e) {
      rootLog.error("Poll tick failed:", e instanceof Error ? e.message : e);
    }
    if (!running) break;
    await sleep(COPY_POLL_INTERVAL_MS);
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
