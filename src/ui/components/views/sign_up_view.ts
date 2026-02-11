import {
  InputRenderableEvents,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import { colors, sizes, type StatusVariant } from "../../design";
import { createAuthFormLayout, createButton, createTextInput } from "../primitives";

type TextInput = ReturnType<typeof createTextInput>;

type SignUpView = {
  view: ReturnType<typeof createAuthFormLayout>["view"];
  usernameInput: TextInput;
  passwordInput: TextInput;
  status: TextRenderable;
  setStatus: (message: string, variant?: StatusVariant) => void;
  focus: () => void;
  getValues: () => { username: string; password: string };
};

type SignUpViewOptions = {
  onSubmit?: (username: string, password: string) => void;
  onBackToLogin?: () => void;
};

export const createSignUpView = (
  renderer: CliRenderer,
  options: SignUpViewOptions = {},
): SignUpView => {
  const usernameInput = createTextInput(renderer, {
    id: "signup-username-input",
    width: sizes.authInputWidth,
    placeholder: "Enter username...",
  });

  const passwordInput = createTextInput(renderer, {
    id: "signup-password-input",
    width: sizes.authInputWidth,
    placeholder: "Enter password...",
  });

  const submit = () => {
    options.onSubmit?.(
      usernameInput.value,
      passwordInput.value,
    );
  };

  const signUpButton = createButton(renderer, {
    id: "signup-button",
    label: "Create account",
    width: sizes.buttonForm,
    height: sizes.buttonHeight,
    variant: "primary",
    onPress: submit,
  });

  const formLayout = createAuthFormLayout(renderer, {
    screenId: "signup",
    formId: "signup-form",
  });

  formLayout.addField("Username", usernameInput);
  formLayout.addField("Password", passwordInput);
  formLayout.addAction(signUpButton);
  formLayout.addLink({
    id: "back-to-login",
    text: "Back to login",
    color: colors.gray500,
    onPress: options.onBackToLogin,
  });

  [usernameInput, passwordInput].forEach((input) => {
    input.on(InputRenderableEvents.ENTER, submit);
  });

  return {
    view: formLayout.view,
    usernameInput,
    passwordInput,
    status: formLayout.status,
    setStatus: formLayout.setStatus,
    focus: () => usernameInput.focus(),
    getValues: () => ({
      username: usernameInput.value,
      password: passwordInput.value,
    }),
  };
};
