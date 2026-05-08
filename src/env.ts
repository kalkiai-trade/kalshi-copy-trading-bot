import "dotenv/config";

const BASE_PATHS = {
  prod: "https://api.elections.kalshi.com/trade-api/v2",
  demo: "https://demo-api.kalshi.co/trade-api/v2",
} as const;

const PEM_HEADER = "-----BEGIN RSA PRIVATE KEY-----";
const PEM_FOOTER = "-----END RSA PRIVATE KEY-----";

function normalizePrivateKeyPem(value: string): string {
  const trimmed = value.trim();
  let base64 = trimmed
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
    .replace(/-----END RSA PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  if (!base64) return trimmed;
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.slice(i, i + 64));
  }
  return `${PEM_HEADER}\n${lines.join("\n")}\n${PEM_FOOTER}`;
}

function followerPem(): string {
  const raw = process.env.KALSHI_PRIVATE_KEY_PEM ?? "";
  return raw ? normalizePrivateKeyPem(raw) : "";
}

function leaderPem(): string {
  const raw = process.env.KALSHI_LEADER_PRIVATE_KEY_PEM ?? "";
  return raw ? normalizePrivateKeyPem(raw) : "";
}

/** Credentials for the follower account that receives mirrored orders. */
export const followerEnv = {
  apiKey: process.env.KALSHI_API_KEY ?? "",
  privateKeyPath: process.env.KALSHI_PRIVATE_KEY_PATH ?? "",
  get privateKeyPem(): string {
    return followerPem();
  },
  demo: process.env.KALSHI_DEMO === "true",
  basePath:
    process.env.KALSHI_BASE_PATH ??
    (process.env.KALSHI_DEMO === "true" ? BASE_PATHS.demo : BASE_PATHS.prod),
} as const;

/** Leader account credentials used only to poll `GET /portfolio/fills`. */
export const leaderEnv = {
  apiKey: process.env.KALSHI_LEADER_API_KEY ?? "",
  privateKeyPath: process.env.KALSHI_LEADER_PRIVATE_KEY_PATH ?? "",
  get privateKeyPem(): string {
    return leaderPem();
  },
  basePath:
    process.env.KALSHI_LEADER_BASE_PATH ?? followerEnv.basePath,
} as const;

export function isLeaderConfigured(): boolean {
  return (
    leaderEnv.apiKey.trim() !== "" &&
    (Boolean(leaderEnv.privateKeyPath.trim()) ||
      leaderEnv.privateKeyPem.trim() !== "")
  );
}

export const COPY_SIZE_MULTIPLIER = Number.parseFloat(
  process.env.COPY_SIZE_MULTIPLIER ?? "1"
);

export const COPY_POLL_INTERVAL_MS = Math.max(
  500,
  parseInt(process.env.COPY_POLL_INTERVAL_MS ?? "3000", 10)
);

export const COPY_POLL_LIMIT = Math.min(
  1000,
  Math.max(1, parseInt(process.env.COPY_POLL_LIMIT ?? "50", 10))
);

/** Optional UNIX seconds floor for leader fills. */
export const COPY_MIN_TS =
  process.env.COPY_MIN_TS !== undefined &&
  process.env.COPY_MIN_TS.trim() !== ""
    ? Number.parseInt(process.env.COPY_MIN_TS!, 10)
    : undefined;

export const COPY_START_LOOKBACK_SEC = Math.max(
  1,
  parseInt(process.env.COPY_START_LOOKBACK_SEC ?? "120", 10)
);

export const COPY_MAX_CONTRACTS = parseInt(
  process.env.COPY_MAX_CONTRACTS ?? "1000000",
  10
);

export const COPY_DRY_RUN = process.env.COPY_DRY_RUN === "true";
