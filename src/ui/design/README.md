# Design System

`src/ui/design/` is the terminal UI equivalent of a global CSS layer.

Use this folder for:

- Design tokens (`tokens.ts`) like colors, spacing, and sizing scales.
- Runtime viewport constraints (`tokens.ts` + `viewport.ts`) like minimum supported terminal size.
- Semantic style mappings (`text.ts`, `components.ts`) that convert tokens into reusable variants.
- A single import surface (`index.ts`) for app-wide style usage.

Recommended workflow:

1. Add or update tokens first (`tokens.ts`).
2. Map tokens to semantic variants (`text.ts`, `components.ts`).
3. Consume variants from primitives in `src/ui/primitives/`.
4. Compose feature screens in `src/ui/screens/`.

This keeps your visual language centralized and avoids hardcoded styles in feature screens.

## UI Rules For This Project

Follow these rules for every new screen:

1. Keyboard-first interaction: every actionable screen must expose a clear focus target.
2. Deterministic layout: keep panel positions stable across state changes.
3. Responsive sizing: avoid large hardcoded widths; use flex/percentages and safe min/max clamps.
4. One-screen composition: route-level layout belongs in `src/ui/screens/`, not primitives.
5. Primitive reuse only: shared controls must be built in `src/ui/primitives/` and reused.
6. Centralized styling: new colors/spacing/sizes go through `tokens.ts` and semantic maps.
