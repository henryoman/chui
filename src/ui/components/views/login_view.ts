import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";
import { colors, sizes, spacing } from "../../design";
import { createButton, createLabel, createTextInput } from "../primitives";

type LoginView = {
  view: BoxRenderable;
  input: ReturnType<typeof createTextInput>;
  status: TextRenderable;
  setStatus: (message: string, color: string) => void;
};

type LoginViewOptions = {
  onSubmit?: (value: string) => void;
};

export const createLoginView = (
  renderer: CliRenderer,
  options: LoginViewOptions = {},
): LoginView => {
  const loginInput = createTextInput(renderer, {
    id: "username-input",
    placeholder: "Enter username...",
  });

  const loginButton = createButton(renderer, {
    id: "login-button",
    label: "login",
    width: sizes.buttonWide,
    height: sizes.buttonHeight,
    variant: "muted",
    onPress: () => {
      options.onSubmit?.(loginInput.value);
    },
  });

  const loginView = new BoxRenderable(renderer, {
    id: "login",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  });

  const loginContent = new BoxRenderable(renderer, {
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.xs,
  });
  loginContent.add(createLabel(renderer, "username"));

  const loginRow = new BoxRenderable(renderer, {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  });
  loginRow.add(loginInput);
  loginRow.add(loginButton);
  loginContent.add(loginRow);

  const status = new TextRenderable(renderer, {
    content: " ",
    fg: colors.gray500,
  });
  loginContent.add(status);
  loginView.add(loginContent);

  const setStatus = (message: string, color: string) => {
    status.content = message || " ";
    status.fg = color;
  };

  return {
    view: loginView,
    input: loginInput,
    status,
    setStatus,
  };
};
