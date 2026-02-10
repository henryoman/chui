import { ConvexHttpClient } from "convex/browser";
import { getAuthToken } from "./session.js";

let client: ConvexHttpClient | null = null;

const getConvexUrl = () => {
  return process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;
};

export const getConvexClient = () => {
  if (client) {
    return client;
  }

  const convexUrl = getConvexUrl();
  if (!convexUrl) {
    throw new Error(
      "Missing Convex URL. Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL.",
    );
  }

  client = new ConvexHttpClient(convexUrl);

  const token = getAuthToken();
  if (token) {
    client.setAuth(token);
  }

  return client;
};

export const setConvexAuthToken = (token: string) => {
  getConvexClient().setAuth(token);
};

export const clearConvexAuthToken = () => {
  getConvexClient().clearAuth();
};
