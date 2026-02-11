import {
  BoxRenderable,
  createCliRenderer,
  LayoutEvents,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import {
  signInWithEmailAndPassword,
  signUpWithUsernameEmailAndPassword,
  listConversationMessages,
  listMyConversations,
  listProfiles,
  sendDirectMessage,
  type ConversationMessage,
  type ConversationSummary,
} from "./data/convex_actions.js";
import {
  createHomeView,
  createLoginView,
  createSignUpView,
  createSplashView,
} from "./ui/components/index.js";
import {
  colors,
  getViewportConstraintMessage,
  isViewportSupported,
  spacing,
} from "./ui/design/index.js";

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
});

type AppRoute = "splash" | "login" | "signup" | "home";

const minSizeView = createMinSizeView(renderer);
let activeRoute: AppRoute = "splash";

let loginView: ReturnType<typeof createLoginView>;
let signUpView: ReturnType<typeof createSignUpView>;
let homeView: ReturnType<typeof createHomeView>;
let currentUsername: string | null = null;
let selectedChatUsername: string | null = null;
let conversationIdByUsername = new Map<string, string>();

const renderCurrentRoute = () => {
  removeIfPresent(renderer, "splash");
  removeIfPresent(renderer, "login");
  removeIfPresent(renderer, "signup");
  removeIfPresent(renderer, "home");
  removeIfPresent(renderer, "min-size");

  if (!isViewportSupported(renderer.width, renderer.height)) {
    minSizeView.setSize(renderer.width, renderer.height);
    renderer.root.add(minSizeView.view);
    return;
  }

  if (activeRoute === "splash") {
    renderer.root.add(splashView.view);
    return;
  }

  if (activeRoute === "login") {
    renderer.root.add(loginView.view);
    loginView.focus();
    return;
  }

  if (activeRoute === "signup") {
    renderer.root.add(signUpView.view);
    signUpView.focus();
    return;
  }

  renderer.root.add(homeView.view);
  homeView.focus();
};

const showHome = async () => {
  activeRoute = "home";
  renderCurrentRoute();
  try {
    await refreshHomeData();
  } catch (error) {
    homeView.setUsers([]);
    homeView.setMessages([]);
    homeView.setSelectedUser(null);
    homeView.setStatus(getErrorMessage(error), colors.error);
  }
};

const showLogin = () => {
  activeRoute = "login";
  renderCurrentRoute();
};

const showSignUp = () => {
  activeRoute = "signup";
  renderCurrentRoute();
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

const toHomeMessages = (messages: ConversationMessage[]) => {
  return messages.map((message) => ({
    id: String(message._id),
    senderUsername: message.senderUsername,
    body: message.body,
    createdAt: message.createdAt,
  }));
};

const loadConversationForUser = async (username: string) => {
  selectedChatUsername = username;
  homeView.setSelectedUser(username);

  const conversationId = conversationIdByUsername.get(username);
  if (!conversationId) {
    homeView.setMessages([]);
    homeView.setStatus(`No conversation with ${username} yet. Send the first message.`);
    return;
  }

  const messages = await listConversationMessages(conversationId, 200);
  homeView.setMessages(toHomeMessages(messages));
  homeView.setStatus(" ");
};

const refreshHomeData = async () => {
  if (!currentUsername) {
    homeView.setUsers([]);
    homeView.setMessages([]);
    homeView.setSelectedUser(null);
    homeView.setStatus("Log in to view conversations", colors.warning);
    return;
  }

  homeView.setCurrentUsername(currentUsername);
  homeView.setStatus("Loading conversations...", colors.warning);

  const [profiles, conversations] = await Promise.all([
    listProfiles(),
    listMyConversations(200),
  ]);

  const chatUsers = profiles
    .map((profile) => profile.username)
    .filter((username) => username !== currentUsername)
    .sort((a, b) => a.localeCompare(b));

  const users = chatUsers.map((username) => ({ username }));
  homeView.setUsers(users);

  const map = new Map<string, string>();
  conversations.forEach((conversation: ConversationSummary) => {
    const otherUsername = conversation.otherUser?.username;
    if (otherUsername) {
      map.set(otherUsername, String(conversation.conversationId));
    }
  });
  conversationIdByUsername = map;

  if (
    selectedChatUsername &&
    users.some((user) => user.username === selectedChatUsername)
  ) {
    await loadConversationForUser(selectedChatUsername);
    return;
  }

  if (users.length === 0) {
    selectedChatUsername = null;
    homeView.setSelectedUser(null);
    homeView.setMessages([]);
    homeView.setStatus("No other users available yet");
    return;
  }

  selectedChatUsername = users[0]?.username ?? null;
  homeView.setSelectedUser(selectedChatUsername);
  if (selectedChatUsername) {
    await loadConversationForUser(selectedChatUsername);
  }
};

const handleSelectChatUser = async (username: string) => {
  try {
    await loadConversationForUser(username);
  } catch (error) {
    homeView.setStatus(getErrorMessage(error), colors.error);
  }
};

const handleSendMessage = async (toUsername: string, body: string) => {
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    homeView.setStatus("Type a message first", colors.warning);
    return;
  }

  try {
    const result = await sendDirectMessage(toUsername, trimmedBody);
    const conversationId = String(result.conversationId);
    conversationIdByUsername.set(toUsername, conversationId);

    const messages = await listConversationMessages(conversationId, 200);
    homeView.setMessages(toHomeMessages(messages));
    homeView.clearComposer();
    homeView.setStatus(" ");
  } catch (error) {
    homeView.setStatus(getErrorMessage(error), colors.error);
    throw error;
  }
};

let isSubmitting = false;

const handleLogin = async (email: string, password: string) => {
  if (isSubmitting) return;

  const e = (email ?? "").trim();
  const p = password ?? "";
  if (!e || !p) {
    loginView.setStatus("Username/email and password required", "error");
    return;
  }

  loginView.setStatus("Signing in...", "warning");
  isSubmitting = true;

  try {
    const result = await signInWithEmailAndPassword(e, p);
    currentUsername = result.username;
    loginView.setStatus(`Logged in as ${result.username}`, "success");
    await showHome();
  } catch (error) {
    loginView.setStatus(getErrorMessage(error), "error");
  } finally {
    isSubmitting = false;
  }
};

const handleSignUp = async (
  username: string,
  password: string,
) => {
  if (isSubmitting) return;

  const u = (username ?? "").trim();
  const p = password ?? "";
  if (!u || !p) {
    signUpView.setStatus("Username and password required", "error");
    return;
  }

  signUpView.setStatus("Creating account...", "warning");
  isSubmitting = true;

  try {
    const result = await signUpWithUsernameEmailAndPassword(u, p);
    currentUsername = result.username;
    signUpView.setStatus(`Logged in as ${result.username}`, "success");
    await showHome();
  } catch (error) {
    signUpView.setStatus(getErrorMessage(error), "error");
  } finally {
    isSubmitting = false;
  }
};

loginView = createLoginView(renderer, {
  onSubmit: handleLogin,
  onSignUpClick: showSignUp,
});

signUpView = createSignUpView(renderer, {
  onSubmit: handleSignUp,
  onBackToLogin: showLogin,
});

homeView = createHomeView(renderer, {
  onSelectUser: handleSelectChatUser,
  onSendMessage: handleSendMessage,
});

const splashView = createSplashView(renderer, { onEnter: showLogin });

renderer.root.on(LayoutEvents.RESIZED, renderCurrentRoute);
renderCurrentRoute();

function removeIfPresent(renderer: CliRenderer, id: string) {
  if (renderer.root.getRenderable(id)) {
    renderer.root.remove(id);
  }
}

function createMinSizeView(renderer: CliRenderer) {
  const view = new BoxRenderable(renderer, {
    id: "min-size",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
    flexDirection: "column",
    gap: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  });

  const title = new TextRenderable(renderer, {
    content: "Resize Terminal",
    fg: colors.yellow,
  });
  const details = new TextRenderable(renderer, {
    content: getViewportConstraintMessage(renderer.width, renderer.height),
    fg: colors.gray300,
    wrapMode: "word",
  });

  view.add(title);
  view.add(details);

  return {
    view,
    setSize: (width: number, height: number) => {
      details.content = getViewportConstraintMessage(width, height);
    },
  };
}
