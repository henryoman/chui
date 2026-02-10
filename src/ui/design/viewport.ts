import { viewport } from "./tokens";

export function isViewportSupported(width: number, height: number) {
  return width >= viewport.minWidth && height >= viewport.minHeight;
}

export function getViewportConstraintMessage(width: number, height: number) {
  return `Terminal too small (${width}x${height}). Minimum ${viewport.minWidth}x${viewport.minHeight}.`;
}
