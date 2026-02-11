import {
  TextAttributes,
  TextRenderable,
  type RenderContext,
} from "@opentui/core";
import { colors } from "./tokens";

export type TextStyle = {
  fg: string;
  attributes?: number;
};

export type TextVariant = "heading" | "subheading" | "body" | "muted";
export type MessageTextVariant = "incoming" | "outgoing" | "system";

export const textStyles: Record<TextVariant, TextStyle> = {
  heading: {
    fg: colors.teal,
    attributes: TextAttributes.BOLD,
  },
  subheading: {
    fg: colors.yellow,
    attributes: TextAttributes.BOLD,
  },
  body: {
    fg: colors.gray300,
  },
  muted: {
    fg: colors.gray500,
  },
};

export const messageTextStyles: Record<MessageTextVariant, TextStyle> = {
  incoming: {
    fg: colors.incomingMessageText,
  },
  outgoing: {
    fg: colors.outgoingMessageText,
  },
  system: {
    fg: colors.systemMessageText,
  },
};

export function createText(
  renderer: RenderContext,
  content: string,
  style: TextStyle,
) {
  return new TextRenderable(renderer, {
    content,
    fg: style.fg,
    attributes: style.attributes,
  });
}

export function createHeadingText(renderer: RenderContext, content: string) {
  return createText(renderer, content, textStyles.heading);
}

export function createSubheadingText(renderer: RenderContext, content: string) {
  return createText(renderer, content, textStyles.subheading);
}

export function createBodyText(renderer: RenderContext, content: string) {
  return createText(renderer, content, textStyles.body);
}
