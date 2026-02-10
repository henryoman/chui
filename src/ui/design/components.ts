import { colors } from "./tokens";

export type ButtonVariant = "primary" | "accent" | "danger" | "muted";

export const buttonStyles: Record<ButtonVariant, { borderColor: string; textColor: string }> = {
  primary: {
    borderColor: colors.teal,
    textColor: colors.teal,
  },
  accent: {
    borderColor: colors.yellow,
    textColor: colors.yellow,
  },
  danger: {
    borderColor: colors.red,
    textColor: colors.red,
  },
  muted: {
    borderColor: colors.gray500,
    textColor: colors.gray700,
  },
};

export type MessageBubbleVariant = "incoming" | "outgoing" | "system";

export const messageBubbleStyles: Record<
  MessageBubbleVariant,
  {
    borderColor: string;
    backgroundColor: string;
    alignSelf: "flex-start" | "flex-end" | "center";
  }
> = {
  incoming: {
    borderColor: "#FF7EB6",
    backgroundColor: "#FFD8E8",
    alignSelf: "flex-start",
  },
  outgoing: {
    borderColor: "#2EC4B6",
    backgroundColor: "#C8F7DC",
    alignSelf: "flex-end",
  },
  system: {
    borderColor: "#F4D35E",
    backgroundColor: "#FFEFC2",
    alignSelf: "center",
  },
};
