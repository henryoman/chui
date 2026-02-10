import { BoxRenderable, type CliRenderer } from "@opentui/core";
import { spacing } from "../../design";
import { createTextBubble } from "../primitives";

type HomeView = {
  view: BoxRenderable;
};

export const createHomeView = (renderer: CliRenderer): HomeView => {
  const homeView = new BoxRenderable(renderer, {
    id: "home",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    flexGrow: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    gap: spacing.sm,
  });

  homeView.add(
    createTextBubble(renderer, {
      id: "sample-bubble-incoming",
      text: "Welcome to CHUI. This is an incoming message bubble.",
      variant: "incoming",
    }),
  );
  homeView.add(
    createTextBubble(renderer, {
      id: "sample-bubble-outgoing",
      text: "Nice. Outgoing messages are right-aligned with their own style.",
      variant: "outgoing",
    }),
  );

  return { view: homeView };
};
