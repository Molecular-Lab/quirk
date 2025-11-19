# RabbitSwap Website

## Development

1. Create .env from .env.example
2. Go develop

```sh
pnpm dev
```

## Deployment

- Automated deploy to production (from branch `main`) and development (from branch `develop`)
- For preview, it's triggered from branch `preview/*` e.g. `preview/123`, and will be deployed to
  `https://preview-*.rabbitswap-interface.pages.dev`
  - Should named it the same number as _**Pull Request ID**_ or _**Feature Name**_
