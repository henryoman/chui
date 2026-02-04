import {
  ASCIIFontRenderable,
  BoxRenderable,
  createCliRenderer,
  InputRenderable,
  TextRenderable,
} from "@opentui/core";
import { asciiStyles, boxStyles, inputStyles, textStyles } from "./ui/design_system.ts";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,

});

let splashView: BoxRenderable;
let loginView: BoxRenderable;
let loginInput: InputRenderable;

const showLogin = () => {
  renderer.root.remove("splash");
  renderer.root.add(loginView);
  loginInput.focus();
};

const enterButton = new BoxRenderable(renderer, {
  ...boxStyles.enterButton,
  onMouseUp: showLogin,
});
enterButton.add(
  new TextRenderable(renderer, {
    content: "enter",
    ...textStyles.enterButton,
  }),
);

splashView = new BoxRenderable(renderer, {
  ...boxStyles.splashView,
});

const splashContent = new BoxRenderable(renderer, {
  ...boxStyles.splashContent,
});
splashContent.add(
  new ASCIIFontRenderable(renderer, {
    text: "CHUI",
    ...asciiStyles.logo,
  }),
);
splashContent.add(
  new TextRenderable(renderer, {
    content: "instant messenger for the terminal",
    ...textStyles.splashTagline,
  }),
);
splashContent.add(enterButton);
splashView.add(splashContent);

loginInput = new InputRenderable(renderer, {
  ...inputStyles.username,
  placeholder: "Enter username...",
});

const loginButton = new BoxRenderable(renderer, {
  ...boxStyles.loginButton,
});
loginButton.add(
  new TextRenderable(renderer, {
    content: "login",
    ...textStyles.loginButton,
  }),
);

loginView = new BoxRenderable(renderer, {
  ...boxStyles.loginView,
});

const loginContent = new BoxRenderable(renderer, {
  ...boxStyles.loginContent,
});
loginContent.add(
  new TextRenderable(renderer, {
    content: "username",
    ...textStyles.usernameLabel,
  }),
);

const loginRow = new BoxRenderable(renderer, {
  ...boxStyles.loginRow,
});
loginRow.add(loginInput);
loginRow.add(loginButton);
loginContent.add(loginRow);
loginContent.add(
  new TextRenderable(renderer, {
    content: "Warning: avoid sharing sensitive info.",
    ...textStyles.warningMessage,
  }),
);
loginView.add(loginContent);

renderer.root.add(splashView);
