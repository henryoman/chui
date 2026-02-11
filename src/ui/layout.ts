import { BoxRenderable, type RenderContext } from "@opentui/core";
import { spacing } from "./design";

type CrossAxisAlign = "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
type MainAxisAlign =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

type PaddedColumnOptions = {
  id: string;
  gap?: number;
  alignItems?: CrossAxisAlign;
  justifyContent?: MainAxisAlign;
};

export function createCenteredScreen(renderer: RenderContext, id: string) {
  return new BoxRenderable(renderer, {
    id,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    width: "100%",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  });
}

export function createPaddedColumnScreen(
  renderer: RenderContext,
  options: PaddedColumnOptions,
) {
  return new BoxRenderable(renderer, {
    id: options.id,
    flexDirection: "column",
    alignItems: options.alignItems ?? "stretch",
    justifyContent: options.justifyContent,
    flexGrow: 1,
    width: "100%",
    gap: options.gap ?? spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
  });
}
