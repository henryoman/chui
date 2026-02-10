# Components

Use `src/ui/components/` as the centralized place for reusable UI building blocks.

Structure:
- `primitives/`: low-level components reused across screens (`button`, `text_input`, etc.).
- `views/`: composed feature views made from primitives and design tokens.
- `index.ts`: single import entry for app code.

Guideline:
- Add new reusable widgets to `primitives/`.
- Keep feature-specific composition inside `views/` or `screens/`.
