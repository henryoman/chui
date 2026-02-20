import { colors } from "./tokens";

export type ButtonVariant = "primary" | "accent" | "danger" | "muted";

export const buttonStyles: Record<ButtonVariant, { borderColor: string; textColor: string }> = {
  primary: {
    borderColor: colors.primary,
    textColor: colors.primary,
  },
  accent: {
    borderColor: colors.secondary,
    textColor: colors.secondary,
  },
  danger: {
    borderColor: colors.danger,
    textColor: colors.danger,
  },
  muted: {
    borderColor: colors.surfaceBorderMuted,
    textColor: colors.textMuted,
  },
};

export type MessageBubbleVariant = "incoming" | "outgoing" | "system";

export const messageBubbleStyles: Record<
  MessageBubbleVariant,
  {
    backgroundColor: string;
    alignSelf: "flex-start" | "flex-end" | "center";
  }
> = {
  incoming: {
    backgroundColor: colors.incomingBubbleBackground,
    alignSelf: "flex-start",
  },
  outgoing: {
    backgroundColor: colors.outgoingBubbleBackground,
    alignSelf: "flex-end",
  },
  system: {
    backgroundColor: colors.systemBubbleBackground,
    alignSelf: "center",
  },
};

export type StatusVariant = "neutral" | "success" | "warning" | "error";

export const statusStyles: Record<StatusVariant, { textColor: string }> = {
  neutral: { textColor: colors.textMuted },
  success: { textColor: colors.success },
  warning: { textColor: colors.warning },
  error: { textColor: colors.error },
};
