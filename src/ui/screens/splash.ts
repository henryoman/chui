import {
  ASCIIFontRenderable,
  BoxRenderable,
  type CliRenderer,
} from "@opentui/core";
import { colors, createBodyText, sizes, spacing } from "../design";
import { createButton } from "../primitives/button";
import { createCenteredScreen } from "../layout";

type SplashScreenOptions = {
  onEnter: () => void;
};

type SplashScreen = {
  view: BoxRenderable;
  focus: () => void;
};

export const createSplashScreen = (
  renderer: CliRenderer,
  options: SplashScreenOptions,
): SplashScreen => {
  const enterButton = createButton(renderer, {
    id: "enter-button",
    label: "enter",
    width: sizes.buttonWide,
    height: sizes.buttonTall,
    variant: "accent",
    onPress: options.onEnter,
  });

  const splashView = createCenteredScreen(renderer, "splash");
  splashView.onKeyDown = (key) => {
    if (key.name === "return" || key.name === "enter" || key.sequence === "\r") {
      options.onEnter();
    }
  };

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

  return {
    view: splashView,
    focus: () => splashView.focus(),
  };
};
