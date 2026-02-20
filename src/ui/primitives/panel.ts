import { BoxRenderable, type RenderContext } from "@opentui/core";

type PanelOptions = {
  id?: string;
  width?: number | string;
  minWidth?: number;
  flexGrow?: number;
  gap?: number;
  padding?: number;
  flexDirection?: "column" | "row";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
};

export function createPanel(renderer: RenderContext, options: PanelOptions = {}) {
  return new BoxRenderable(renderer, {
    id: options.id,
    border: true,
    borderStyle: "single",
    flexDirection: options.flexDirection ?? "column",
    width: options.width,
    minWidth: options.minWidth,
    flexGrow: options.flexGrow,
    gap: options.gap,
    padding: options.padding,
    alignItems: options.alignItems,
    justifyContent: options.justifyContent,
  });
}
