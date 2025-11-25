# RabbitSwap API

## Development

1. Start Database connection (local or `make db-dev` at root of this repository)
2. Start Redis connection
3. Create .env from .env.example
4. Go develop

```sh
pnpm dev
```

## Deployment

- Add tag in format `{service}@v{x.x.x}` e.g. `api@v0.1.0`. It will build an image via
  [Github Action](https://github.com/Proxify/rabbitswap-interface/actions)
- Update the deployed version at [rabbitswap-gitops](https://github.com/Proxify/rabbitswap-gitops)
- After pushing to remote, it will deployed to kubernetes. Access the deployment control at
  [ArgoCD](https://argocd.arken.finance/applications)
