import {
  clearConvexAuthToken,
  getConvexClient,
  setConvexAuthToken,
} from "./convex.js";
import { clearAuthToken, setAuthToken } from "./session.js";

type LoginResult = {
  userId: string;
  username: string;
};

const runMutation = async <TResult>(
  path: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  return await getConvexClient().mutation(path as any, args as any);
};

const runQuery = async <TResult>(
  path: string,
  args: Record<string, unknown>,
): Promise<TResult> => {
  return await getConvexClient().query(path as any, args as any);
};

export type AuthLoginResult = {
  token: string;
  username: string;
};

export const signUpWithUsernameAndPassword = async (
  username: string,
  password: string,
): Promise<AuthLoginResult> => {
  const result = await runMutation<AuthLoginResult>(
    "auth:signUpWithUsernameAndPassword",
    { username, password },
  );

  setAuthToken(result.token);
  setConvexAuthToken(result.token);

  return result;
};

export const signInWithUsernameAndPassword = async (
  username: string,
  password: string,
): Promise<AuthLoginResult> => {
  const result = await runMutation<AuthLoginResult>(
    "auth:signInWithUsernameAndPassword",
    { username, password },
  );

  setAuthToken(result.token);
  setConvexAuthToken(result.token);

  return result;
};

export const signOut = async (): Promise<void> => {
  await runMutation("auth:signOut", {});
  clearAuthToken();
  clearConvexAuthToken();
};

export const getCurrentUser = async () => {
  return await runQuery<unknown>("auth:getCurrentUser", {});
};

export const upsertByUsername = async (username: string): Promise<LoginResult> => {
  return await runMutation<LoginResult>("users:upsertByUsername", { username });
};
