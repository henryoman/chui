![CHUI screenshot](./chui.png)

# CHUI

![Bun](https://img.shields.io/badge/runtime-Bun-black?logo=bun&logoColor=white)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)
![OpenTUI](https://img.shields.io/badge/interface-OpenTUI-0f172a)
![Convex](https://img.shields.io/badge/backend-Convex-EE342F)
![Better%20Auth](https://img.shields.io/badge/auth-Better%20Auth-2563eb)
![Status](https://img.shields.io/badge/status-active%20development-f59e0b)

CHUI is a terminal-first chat app built with OpenTUI, Convex, and Better Auth.

## What You Can Do

- Create an account and sign in from the terminal.
- Browse other users and open direct message conversations.
- Send and read messages in a keyboard-friendly TUI.

## Quick Start

### 1) Install dependencies

```bash
bun install
```

### 2) Start Convex

```bash
bun run convex:dev
```

### 3) Run the app

In a second terminal:

```bash
bun dev
```

## Environment Setup

CHUI needs a Convex URL at runtime:

- `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL`

You also need these Convex deployment env vars for auth:

- `BETTER_AUTH_SECRET`
- `SITE_URL`

Set them with:

```bash
bun x convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
bun x convex env set SITE_URL http://localhost:3000
```

After Convex `_generated` files are available, regenerate Better Auth schema if needed:

```bash
bun run auth:generate-schema
```

## Scripts

- `bun dev` - Run the TUI in watch mode.
- `bun run convex:dev` - Start local Convex development.
- `bun run auth:generate-schema` - Regenerate Better Auth schema.

## Tech Stack

- OpenTUI (`@opentui/core`)
- Convex
- Better Auth
- TypeScript + Bun

## Project Structure

- `src/index.ts` - CLI/TUI entry point.
- `src/app/` - App state, routing, actions, scheduling.
- `src/ui/` - Layouts, UI components, and views.
- `src/data/` - Session helpers and external data integrations.
- `convex/` - Backend functions and auth setup.
