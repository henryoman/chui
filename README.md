# core

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This project was created using `bun create tui`. [create-tui](https://git.new/create-tui) is the easiest way to get started with OpenTUI.

## Convex + Better Auth (basic setup)

- Run Convex dev:
  - `bun run convex:dev`
- Set required Convex env vars:
  - `bun x convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)`
  - `bun x convex env set SITE_URL http://localhost:3000`
- Ensure your local env has:
  - `NEXT_PUBLIC_CONVEX_URL=<your convex url>`

After `_generated` is available, you can regenerate Better Auth schema:

```bash
bun run auth:generate-schema
```
