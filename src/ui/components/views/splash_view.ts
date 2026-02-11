import { ASCIIFontRenderable, BoxRenderable, type CliRenderer } from "@opentui/core";
import { colors, createBodyText, sizes, spacing } from "../../design";
import { createButton } from "../primitives";
import { createCenteredScreen } from "../../layout";

type SplashViewOptions = {
  onEnter: () => void;
};

type SplashView = {
  view: BoxRenderable;
};

export const createSplashView = (
  renderer: CliRenderer,
  options: SplashViewOptions,
): SplashView => {
  const enterButton = createButton(renderer, {
    id: "enter-button",
    label: "enter",
    width: sizes.buttonWide,
    height: sizes.buttonTall,
    variant: "accent",
    onPress: options.onEnter,
  });

  const splashView = createCenteredScreen(renderer, "splash");

  const splashContent = new BoxRenderable(renderer, {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
  });
  splashContent.add(
    new ASCIIFontRenderable(renderer, {
      font: "block",
      text: "CHUI",
      color: colors.teal,
    }),
  );
  splashContent.add(createBodyText(renderer, "instant messenger for the terminal"));
  splashContent.add(enterButton);
  splashView.add(splashContent);

  return { view: splashView };
};
