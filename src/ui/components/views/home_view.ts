import {
  BoxRenderable,
  InputRenderableEvents,
  ScrollBoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import { colors, sizes, spacing } from "../../design";
import { createButton, createTextBubble, createTextInput } from "../primitives";

export type HomeChatUser = {
  username: string;
};

export type HomeChatMessage = {
  id?: string;
  senderUsername: string;
  body: string;
  createdAt: number;
};

type HomeView = {
  view: BoxRenderable;
  focus: () => void;
  setCurrentUsername: (username: string) => void;
  setUsers: (users: HomeChatUser[]) => void;
  setSelectedUser: (username: string | null) => void;
  setMessages: (messages: HomeChatMessage[]) => void;
  clearComposer: () => void;
  setStatus: (message: string, color?: string) => void;
};

type HomeViewOptions = {
  onSelectUser?: (username: string) => void | Promise<void>;
  onSendMessage?: (toUsername: string, body: string) => void | Promise<void>;
};

export const createHomeView = (
  renderer: CliRenderer,
  options: HomeViewOptions = {},
): HomeView => {
  let currentUsername = "";
  let selectedUsername: string | null = null;
  let users: HomeChatUser[] = [];
  let messages: HomeChatMessage[] = [];
  let sending = false;
  let userRowIds: string[] = [];
  let messageBubbleIds: string[] = [];

  const view = new BoxRenderable(renderer, {
    id: "home",
    flexDirection: "row",
    flexGrow: 1,
    width: "100%",
    gap: spacing.sm,
    padding: spacing.sm,
  });

  const usersPanel = new BoxRenderable(renderer, {
    id: "chat-users-panel",
    width: 28,
    minWidth: 20,
    border: true,
    flexDirection: "column",
    gap: spacing.xs,
    padding: spacing.sm,
  });

  const usersTitle = new TextRenderable(renderer, {
    content: "Users",
    fg: colors.teal,
  });
  usersPanel.add(usersTitle);

  const usersScroll = new ScrollBoxRenderable(renderer, {
    id: "chat-users-scroll",
    flexGrow: 1,
    stickyScroll: true,
    stickyStart: "top",
  });
  usersPanel.add(usersScroll);

  const chatPanel = new BoxRenderable(renderer, {
    id: "chat-panel",
    flexDirection: "column",
    flexGrow: 1,
    border: true,
    padding: spacing.sm,
    gap: spacing.xs,
  });

  const chatHeader = new TextRenderable(renderer, {
    id: "chat-header",
    content: "Select a user to start chatting",
    fg: colors.yellow,
  });
  chatPanel.add(chatHeader);

  const messagesScroll = new ScrollBoxRenderable(renderer, {
    id: "chat-messages-scroll",
    flexGrow: 1,
    stickyScroll: true,
    stickyStart: "bottom",
    border: true,
    padding: spacing.xs,
  });
  chatPanel.add(messagesScroll);

  const composerRow = new BoxRenderable(renderer, {
    id: "chat-composer-row",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  });

  const composerInput = createTextInput(renderer, {
    id: "chat-composer-input",
    width: sizes.authInputWidth,
    placeholder: "Type a message...",
  });
  let submitMessage = () => {};
  const sendButton = createButton(renderer, {
    id: "chat-send-button",
    label: "Send",
    width: sizes.buttonWide,
    height: sizes.buttonHeight,
    variant: "accent",
    onPress: () => submitMessage(),
  });

  composerRow.add(composerInput);
  composerRow.add(sendButton);
  chatPanel.add(composerRow);

  const status = new TextRenderable(renderer, {
    id: "chat-status",
    content: " ",
    fg: colors.gray500,
  });
  chatPanel.add(status);

  view.add(usersPanel);
  view.add(chatPanel);

  const setStatus = (message: string, color: string = colors.gray500) => {
    status.content = message || " ";
    status.fg = color;
  };

  const updateHeader = () => {
    if (!selectedUsername) {
      chatHeader.content = "Select a user to start chatting";
      return;
    }

    chatHeader.content = `Conversation with ${selectedUsername}`;
  };

  const renderUsers = () => {
    userRowIds.forEach((id) => usersScroll.remove(id));
    userRowIds = [];

    if (users.length === 0) {
      const id = "chat-user-empty";
      usersScroll.add(
        new TextRenderable(renderer, {
          id,
          content: "No users found",
          fg: colors.gray500,
        }),
      );
      userRowIds.push(id);
      return;
    }

    users.forEach((user, index) => {
      const id = `chat-user-${index}`;
      const selected = user.username === selectedUsername;
      const row = new BoxRenderable(renderer, {
        id,
        border: true,
        borderStyle: "single",
        borderColor: selected ? colors.teal : colors.gray700,
        backgroundColor: selected ? colors.outgoingBubbleBackground : undefined,
        paddingLeft: spacing.sm,
        paddingRight: spacing.sm,
        paddingTop: spacing.xs,
        paddingBottom: spacing.xs,
        marginBottom: spacing.xs,
        onMouseUp: () => {
          if (selectedUsername !== user.username) {
            selectedUsername = user.username;
            messages = [];
            updateHeader();
            renderUsers();
            renderMessages();
          }

          Promise.resolve(options.onSelectUser?.(user.username)).catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            setStatus(message, colors.error);
          });
        },
      });

      row.add(
        new TextRenderable(renderer, {
          content: user.username,
          fg: selected ? colors.gray700 : colors.gray100,
        }),
      );

      usersScroll.add(row);
      userRowIds.push(id);
    });
  };

  const renderMessages = () => {
    messageBubbleIds.forEach((id) => messagesScroll.remove(id));
    messageBubbleIds = [];

    if (!selectedUsername) {
      const id = "chat-empty-unselected";
      messagesScroll.add(
        createTextBubble(renderer, {
          id,
          text: "Pick a username on the left to open a conversation.",
          variant: "system",
        }),
      );
      messageBubbleIds.push(id);
      return;
    }

    if (messages.length === 0) {
      const id = "chat-empty-thread";
      messagesScroll.add(
        createTextBubble(renderer, {
          id,
          text: `No messages with ${selectedUsername} yet. Say hello.`,
          variant: "system",
        }),
      );
      messageBubbleIds.push(id);
      return;
    }

    messages.forEach((message, index) => {
      const bubbleId = message.id ?? `chat-message-${index}`;
      const variant =
        message.senderUsername === currentUsername ? "outgoing" : "incoming";
      messagesScroll.add(
        createTextBubble(renderer, {
          id: bubbleId,
          text: message.body,
          variant,
        }),
      );
      messageBubbleIds.push(bubbleId);
    });

    messagesScroll.scrollTo({
      x: 0,
      y: messagesScroll.scrollHeight,
    });
  };

  submitMessage = () => {
    if (sending) return;
    if (!selectedUsername) {
      setStatus("Select a user first", colors.warning);
      return;
    }

    const body = composerInput.value.trim();
    if (!body) {
      setStatus("Type a message first", colors.warning);
      return;
    }

    sending = true;
    setStatus("Sending...", colors.warning);

    Promise.resolve(options.onSendMessage?.(selectedUsername, body))
      .then(() => {
        composerInput.value = "";
        setStatus(" ");
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(message, colors.error);
      })
      .finally(() => {
        sending = false;
        composerInput.focus();
      });
  };

  composerInput.on(InputRenderableEvents.ENTER, submitMessage);

  updateHeader();
  renderUsers();
  renderMessages();

  return {
    view,
    focus: () => composerInput.focus(),
    setCurrentUsername: (username: string) => {
      currentUsername = username;
      renderMessages();
    },
    setUsers: (nextUsers: HomeChatUser[]) => {
      users = nextUsers;
      if (selectedUsername && !users.some((u) => u.username === selectedUsername)) {
        selectedUsername = null;
      }
      updateHeader();
      renderUsers();
      renderMessages();
    },
    setSelectedUser: (username: string | null) => {
      selectedUsername = username;
      updateHeader();
      renderUsers();
      renderMessages();
    },
    setMessages: (nextMessages: HomeChatMessage[]) => {
      messages = [...nextMessages].sort((a, b) => a.createdAt - b.createdAt);
      renderMessages();
    },
    clearComposer: () => {
      composerInput.value = "";
    },
    setStatus,
  };
};
