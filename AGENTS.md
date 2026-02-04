# Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts` is the current CLI/TUI entry point (used by `bun dev`).
- `src/app/` holds app state, routing, actions, and scheduling logic.
- `src/ui/` contains layouts, components, and screen views.
- `src/data/` contains session/subscription helpers and external data integrations.

## Build, Test, and Development Commands
- `bun install` installs dependencies from `package.json`.
- `bun dev` runs the TUI in watch mode via `bun run --watch src/index.ts`.
- No build or test scripts are defined yet. Add them to `package.json` when introducing a build step or a test runner.

## Coding Style & Naming Conventions
- TypeScript with ESM (`"type": "module"`) and strict type-checking per `tsconfig.json`.
- Follow the existing formatting: 2-space indentation and trailing commas in multi-line objects/arrays.
- Naming:
  - Functions/variables: `camelCase`.
  - Components: `PascalCase`.
  - File names in `src/ui/` and `src/data/`: `snake_case.ts` (e.g., `message_list.ts`).
- Keep exports explicit and local, and align new modules with the current folder boundaries.

## Testing Guidelines
- No test framework is configured in this repository.
- If you add tests, create a `tests/` folder and add a script such as `bun test` (or your chosen runner) to `package.json`, then document it here.

## Commit & Pull Request Guidelines
- This checkout has no Git history available, so no established commit convention can be inferred.
- Use Conventional Commits unless maintainers specify otherwise (e.g., `feat: add inbox screen`).
- PRs should include:
  - A short summary and the reasoning behind the change.
  - Steps to verify (commands or manual test steps).
  - Screenshots or terminal recordings for UI-affecting changes.

## Configuration Notes
- The app depends on `@opentui/core`; run it in a terminal that supports the required TUI capabilities.
- If you introduce environment variables or external services, document them in `README.md` and add sample config files if needed.
