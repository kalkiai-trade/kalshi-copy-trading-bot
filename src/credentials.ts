import { followerEnv, isLeaderConfigured, leaderEnv } from "./env";
import { createLogger } from "./logger";

const log = createLogger("credentials");

export function assertFollowerCredentials(): void {
  if (!followerEnv.apiKey.trim()) {
    log.warn("KALSHI_API_KEY is empty; follower orders will fail.");
  }
  if (!followerEnv.privateKeyPath && !followerEnv.privateKeyPem.trim()) {
    log.warn(
      "No KALSHI_PRIVATE_KEY_PATH or KALSHI_PRIVATE_KEY_PEM for follower."
    );
  }
}

export function assertLeaderCredentials(): void {
  if (!isLeaderConfigured()) {
    log.error(
      "Leader not configured. Set KALSHI_LEADER_API_KEY and leader private key material."
    );
    process.exit(1);
  }
  if (!leaderEnv.apiKey.trim()) {
    log.error("KALSHI_LEADER_API_KEY is empty.");
    process.exit(1);
  }
  if (!leaderEnv.privateKeyPath && !leaderEnv.privateKeyPem.trim()) {
    log.error(
      "Leader needs KALSHI_LEADER_PRIVATE_KEY_PATH or KALSHI_LEADER_PRIVATE_KEY_PEM."
    );
    process.exit(1);
  }
}

export function assertDistinctAccounts(): void {
  if (
    followerEnv.apiKey.trim() &&
    leaderEnv.apiKey.trim() &&
    followerEnv.apiKey === leaderEnv.apiKey
  ) {
    log.error(
      "Leader and follower API keys must differ — use two Kalshi accounts."
    );
    process.exit(1);
  }
}
