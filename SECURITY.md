# Security

- Never commit `.env` or real PEM material. Treat API keys as **full trading access** until Kalshi ships scoped tokens.
- Leader keys can move capital; store them in a secrets manager and rotate if leaked.
- Run `COPY_DRY_RUN=true` when validating configuration in shared environments.
