import { Configuration } from "kalshi-typescript";
import { followerEnv, isLeaderConfigured, leaderEnv } from "./env";

export function createFollowerConfiguration(): Configuration {
  return new Configuration({
    apiKey: followerEnv.apiKey,
    basePath: followerEnv.basePath,
    ...(followerEnv.privateKeyPath
      ? { privateKeyPath: followerEnv.privateKeyPath }
      : followerEnv.privateKeyPem
        ? { privateKeyPem: followerEnv.privateKeyPem }
        : {}),
  });
}

export function createLeaderConfiguration(): Configuration | null {
  if (!isLeaderConfigured()) return null;
  return new Configuration({
    apiKey: leaderEnv.apiKey,
    basePath: leaderEnv.basePath,
    ...(leaderEnv.privateKeyPath
      ? { privateKeyPath: leaderEnv.privateKeyPath }
      : leaderEnv.privateKeyPem
        ? { privateKeyPem: leaderEnv.privateKeyPem }
        : {}),
  });
}
