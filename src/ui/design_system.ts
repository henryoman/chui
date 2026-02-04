import { TextAttributes } from "@opentui/core";

export const colors = {
  red: "#ff4d4f",
  yellow: "#fadb14",
  cyan: "#13c2c2",
};

export const asciiStyles = {
  logo: {
    font: "block",
  },
};

export const textStyles = {
  enterButton: {},
  splashTagline: {
    fg: colors.cyan,
    attributes: TextAttributes.DIM,
  },
  loginButton: {
    fg: colors.yellow,
  },
  usernameLabel: {},
  warningMessage: {
    fg: colors.red,
  },
};

export const boxStyles = {
  enterButton: {
    width: 9,
    height: 5,
    border: true,
    alignItems: "center",
    justifyContent: "center",
  },
  splashView: {
    id: "splash",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  splashContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  loginButton: {
    width: 9,
    height: 3,
    border: true,
    alignItems: "center",
    justifyContent: "center",
  },
  loginView: {
    id: "login",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  loginContent: {
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
};

export const inputStyles = {
  username: {
    id: "username-input",
    width: 24,
  },
};
