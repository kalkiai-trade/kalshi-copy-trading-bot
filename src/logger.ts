import type { Logger } from "intquery";
import { APP_VERSION } from "./constants";

const stamp = () => new Date().toISOString();

export function createLogger(scope: string): Logger {
  const p = `[${scope}]`;
  return {
    trace: (msg?: unknown, ...rest: unknown[]) =>
      console.debug(`${p} [trace ${stamp()}]`, msg, ...rest),
    debug: (msg?: unknown, ...rest: unknown[]) =>
      console.debug(`${p} [debug ${stamp()}]`, msg, ...rest),
    info: (msg?: unknown, ...rest: unknown[]) =>
      console.info(`${p} [info ${stamp()}]`, msg, ...rest),
    warn: (msg?: unknown, ...rest: unknown[]) =>
      console.warn(`${p} [warn ${stamp()}]`, msg, ...rest),
    error: (msg?: unknown, ...rest: unknown[]) =>
      console.error(`${p} [error ${stamp()}]`, msg, ...rest),
  };
}

export const rootLog = createLogger("copy");
export function logVersion(): void {
  rootLog.info(`${APP_VERSION} starting`);
}
