### Copy-flow details

Kalshi exposes each account’s executions through `PortfolioApi.getFills`. This CLI treats one account’s fills as immutable **leader** events and re-sends analogous **follower** `OrdersApi.createOrder` requests.

Because each fill already matched at posting time, mirrored orders cannot guarantee fills at identical prices—you are restating intentions as fresh GTC bids/offers scaled by `COPY_SIZE_MULTIPLIER`.

For production workloads you typically want alerting, persisted high-watermarks (to survive restarts), and cursor paging when more than `COPY_POLL_LIMIT` hits arrive inside a single polling window.
