import {
  clearConvexAuthToken,
  getConvexClient,
  setConvexAuthToken,
} from "./convex.js";
import { clearAuthToken, getSessionToken, setAuthToken } from "./session.js";
import { parseUsernameOrThrow, type Username } from "../../shared/username.js";

const runMutation = async <TResult>(
  path: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  return await getConvexClient().mutation(path as any, args as any);
};

const runAction = async <TResult>(
  path: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  return await getConvexClient().action(path as any, args as any);
};

const runQuery = async <TResult>(
  path: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  return await getConvexClient().query(path as any, args as any);
};

export type AuthLoginResult = {
  token: string;
  sessionToken?: string;
  username: Username;
  userId: string;
};

export const signUpWithUsernameEmailAndPassword = async (
  username: Username,
  password: string,
  email?: string,
): Promise<AuthLoginResult> => {
  const result = await runAction<Omit<AuthLoginResult, "username"> & { username: string }>(
    "auth:signUpWithUsernameEmailAndPassword",
    { username, email, password },
  );
  const typedResult: AuthLoginResult = {
    ...result,
    username: parseUsernameOrThrow(result.username),
  };

  setAuthToken(typedResult.token, typedResult.sessionToken ?? null);
  setConvexAuthToken(typedResult.token);

  return typedResult;
};

export const signInWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<AuthLoginResult> => {
  const result = await runAction<Omit<AuthLoginResult, "username"> & { username: string }>(
    "auth:signInWithEmailAndPassword",
    { email, password },
  );
  const typedResult: AuthLoginResult = {
    ...result,
    username: parseUsernameOrThrow(result.username),
  };

  setAuthToken(typedResult.token, typedResult.sessionToken ?? null);
  setConvexAuthToken(typedResult.token);

  return typedResult;
};

export const refreshConvexTokenFromSession = async (
  sessionToken: string,
): Promise<{ token: string }> => {
  return await runAction("auth:refreshConvexTokenFromSession", { sessionToken });
};

export const restoreConvexAuthFromSession = async (): Promise<boolean> => {
  const sessionToken = getSessionToken();
  if (!sessionToken) {
    return false;
  }

  try {
    const refreshed = await refreshConvexTokenFromSession(sessionToken);
    setAuthToken(refreshed.token, sessionToken);
    setConvexAuthToken(refreshed.token);
    return true;
  } catch {
    clearAuthToken();
    clearConvexAuthToken();
    return false;
  }
};

export const listProfiles = async (): Promise<{ username: Username; email?: string }[]> => {
  const profiles = await runQuery<Array<{ username: string; email?: string }>>("auth:listProfiles", {});
  return profiles.map((profile) => ({
    ...profile,
    username: parseUsernameOrThrow(profile.username),
  }));
};

export type ConversationSummary = {
  conversationId: string;
  updatedAt: number;
  lastMessageAt?: number;
  lastMessagePreview?: string;
  otherUser: { userId: string; username: Username } | null;
};

export type ConversationMessage = {
  _id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
  senderUsername: Username;
};

export const sendDirectMessage = async (
  toUsername: Username,
  body: string,
): Promise<{ conversationId: string; messageId: string; createdAt: number }> => {
  return await runMutation("messages:sendDirectMessage", {
    toUsername,
    body,
  });
};

export const listMyConversations = async (
  limit?: number,
): Promise<ConversationSummary[]> => {
  const conversations = await runQuery<Array<Omit<ConversationSummary, "otherUser"> & {
    otherUser: { userId: string; username: string } | null;
  }>>("messages:listMyConversations", { limit });
  return conversations.map((conversation) => ({
    ...conversation,
    otherUser: conversation.otherUser
      ? {
          ...conversation.otherUser,
          username: parseUsernameOrThrow(conversation.otherUser.username),
        }
      : null,
  }));
};

export const listConversationMessages = async (
  conversationId: string,
  limit?: number,
): Promise<ConversationMessage[]> => {
  const messages = await runQuery<Array<Omit<ConversationMessage, "senderUsername"> & {
    senderUsername: string;
  }>>("messages:listConversationMessages", {
    conversationId,
    limit,
  });
  return messages.map((message) => ({
    ...message,
    senderUsername: parseUsernameOrThrow(message.senderUsername),
  }));
};

export const signOut = async (): Promise<void> => {
  await runMutation("auth:signOut", {});
  clearAuthToken();
  clearConvexAuthToken();
};

export const getCurrentUser = async () => {
  return await runQuery<unknown>("auth:getCurrentUser", {});
};
