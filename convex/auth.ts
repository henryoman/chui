import { action, mutation, query } from "./_generated/server";
import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./betterAuth/auth";
import {
  parseUsernameOrThrow,
  USERNAME_RULES_TEXT,
  type Username,
} from "../shared/username";

const upsertProfileInternalRef = makeFunctionReference<
  "mutation",
  { username: string; authUserId?: string; email?: string },
  string
>("profiles_internal:upsertProfileInternal");

const USERNAME_EMAIL_DOMAIN = "users.chui.local";

const usernameToEmail = (username: Username) =>
  `${username}@${USERNAME_EMAIL_DOMAIN}`;

const getConvexJwtFromSessionToken = async (
  auth: ReturnType<typeof createAuth>,
  sessionToken: string | null | undefined,
) => {
  if (!sessionToken) {
    throw new Error("Authentication session token missing");
  }
  const { token } = await auth.api.getToken({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
  return token;
};

export const { getAuthUser } = authComponent.clientApi();

export const signUpWithUsernameEmailAndPassword = action({
  args: {
    username: v.string(),
    email: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = parseUsernameOrThrow(args.username, `Username: ${USERNAME_RULES_TEXT}`);
    const requestedEmail = (args.email ?? "").trim().toLowerCase();
    const email = requestedEmail && requestedEmail.includes("@")
      ? requestedEmail
      : usernameToEmail(username);
    const auth = createAuth(ctx);

    const result = await auth.api.signUpEmail({
      body: {
        name: username,
        email,
        password: args.password,
      },
    });
    const convexToken = await getConvexJwtFromSessionToken(auth, result.token);

    const userId = await ctx.runMutation(upsertProfileInternalRef, {
      username,
      authUserId: result.user.id,
      email,
    });

    return {
      token: convexToken,
      sessionToken: result.token,
      username,
      userId,
    };
  },
});

export const signInWithEmailAndPassword = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    let email = args.email.trim().toLowerCase();
    if (!email) throw new Error("Email required");
    if (!email.includes("@")) {
      email = usernameToEmail(parseUsernameOrThrow(args.email, `Username: ${USERNAME_RULES_TEXT}`));
    }
    const auth = createAuth(ctx);

    const result = await auth.api.signInEmail({
      body: {
        email,
        password: args.password,
        rememberMe: true,
      },
    });
    const convexToken = await getConvexJwtFromSessionToken(auth, result.token);

    const resolvedUsername = parseUsernameOrThrow(
      result.user.name ?? "",
      `Username: ${USERNAME_RULES_TEXT}`,
    );
    const userId = await ctx.runMutation(upsertProfileInternalRef, {
      username: resolvedUsername,
      authUserId: result.user.id,
    });

    return {
      token: convexToken,
      sessionToken: result.token,
      username: resolvedUsername,
      userId,
    };
  },
});

export const refreshConvexTokenFromSession = action({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = createAuth(ctx);
    const token = await getConvexJwtFromSessionToken(auth, args.sessionToken);
    return { token };
  },
});

export const signOut = mutation({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.signOut({ headers });
    return { success: true };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const authUser = await authComponent.safeGetAuthUser(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user_id", (q) =>
        q.eq("authUserId", identity.subject),
      )
      .unique();

    return {
      identity,
      authUser,
      profile,
    };
  },
});

export const listProfiles = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const profiles = await ctx.db.query("profiles").collect();
    return profiles.map((p) => ({
      username: p.username,
      email: p.email,
    }));
  },
});
