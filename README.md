# Kalshi copy trading bot

TypeScript Node CLI that polls a Kalshi **leader** account’s [`GET /portfolio/fills`](https://docs.kalshi.com/) timeline and submits matching limit orders through a distinct **follower** account (`kalshi-typescript` + **`ts-logger-pack`** typings for logging).

Logging implements the [`Logger`](https://www.npmjs.com/package/ts-logger-pack) surface so downstream packages can substitute structured backends without refactoring call sites.

## Requirements

Two Kalshi logins:

- Leader: read-only credential purpose in practice—but the API grants full account scope, so safeguard those keys outside production unless you deliberately trade from that wallet.
- Follower: the account receiving mirrored `createOrder` calls.

Mirror rules copy `ticker`, `side` (`yes`|`no`), `action` (`buy`|`sell`), a limit price reconstructed from dollar strings on the leader fill record, and a contract count multiplied by `COPY_SIZE_MULTIPLIER` (floored after rounding).

## Setup

```bash
cp .env.sample .env
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run copy` | Long-running follower mirroring loop. |
| `npm run build` | Emit `dist/`. |
| `npm run typecheck` | `tsc --noEmit`. |

## Safety

Paper-test with Kalshi Demo (`KALSHI_DEMO=true`) whenever possible.

`COPY_DRY_RUN=true` logs intended follower orders without calling `createOrder`.

Leaders placing marketable orders may fill instantly; mirrored GTC rests may linger or incur different liquidity—this is directional automation, not HFT cloning.

Additional notes live in [`docs/copy-flow.md`](docs/copy-flow.md).

## License

MIT — see [`LICENSE`](LICENSE).

## References

- [Kalshi API overview](https://docs.kalshi.com/)
- [kalshi-typescript](https://www.npmjs.com/package/kalshi-typescript)
