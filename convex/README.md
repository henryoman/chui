# Convex + Better Auth Setup

This repo uses Better Auth with Convex (email/password enabled).

## One-time setup

1. Run Convex dev server:
   - `bun run convex:dev`
2. Set required Convex env vars:
   - `bun x convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)`
   - `bun x convex env set SITE_URL http://localhost:3000`
3. Ensure local app env has your Convex URL:
   - `NEXT_PUBLIC_CONVEX_URL=...`

## Optional schema regeneration

After `convex dev` is running and `_generated` exists:

- `bun run auth:generate-schema`

This regenerates `convex/betterAuth/schema.ts`.
