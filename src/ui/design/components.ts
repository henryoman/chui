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
    borderColor: colors.incomingBubbleBorder,
    backgroundColor: colors.incomingBubbleBackground,
    alignSelf: "flex-start",
  },
  outgoing: {
    borderColor: colors.teal,
    backgroundColor: colors.outgoingBubbleBackground,
    alignSelf: "flex-end",
  },
  system: {
    borderColor: colors.yellow,
    backgroundColor: colors.systemBubbleBackground,
    alignSelf: "center",
  },
};

export type StatusVariant = "neutral" | "success" | "warning" | "error";

export const statusStyles: Record<StatusVariant, { textColor: string }> = {
  neutral: { textColor: colors.gray500 },
  success: { textColor: colors.success },
  warning: { textColor: colors.warning },
  error: { textColor: colors.error },
};
