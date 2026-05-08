/**
 * Register OS signals so long-running tasks can exit cleanly (logs flush, etc.).
 */
export function installShutdownHandlers(onShutdown: () => void): void {
  const handle = (): void => {
    onShutdown();
    process.exit(0);
  };
  process.on("SIGINT", handle);
  process.on("SIGTERM", handle);
}
