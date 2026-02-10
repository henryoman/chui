import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "./betterAuth/auth";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const USERNAME_EMAIL_DOMAIN = "users.chui.local";

const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

const requireValidUsername = (rawUsername: string) => {
  const username = normalizeUsername(rawUsername);
  if (!USERNAME_RE.test(username)) {
    throw new Error("Username must be 3-20 characters: [a-z0-9_]");
  }
  return username;
};

const usernameToEmail = (username: string) =>
  `${username}@${USERNAME_EMAIL_DOMAIN}`;

type ProfileCtx = {
  db: {
    query: (...args: unknown[]) => any;
    patch: (...args: unknown[]) => Promise<unknown>;
    insert: (...args: unknown[]) => Promise<unknown>;
  };
};

const upsertProfile = async (
  ctx: ProfileCtx,
  username: string,
  authUserId: string | undefined,
) => {
  const now = Date.now();
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_username", (q: any) => q.eq("username", username))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      updatedAt: now,
      authUserId: authUserId ?? existing.authUserId,
    });
    return;
  }

  await ctx.db.insert("profiles", {
    username,
    authUserId,
    createdAt: now,
    updatedAt: now,
  });
};

export const { getAuthUser } = authComponent.clientApi();

export const signUpWithUsernameAndPassword = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = requireValidUsername(args.username);
    const auth = createAuth(ctx);

    const result = await auth.api.signUpEmail({
      body: {
        name: username,
        email: usernameToEmail(username),
        password: args.password,
      },
    });

    await upsertProfile(ctx, username, result.user.id);

    return {
      token: result.token,
      username,
    };
  },
});

export const signInWithUsernameAndPassword = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const username = requireValidUsername(args.username);
    const auth = createAuth(ctx);

    const result = await auth.api.signInEmail({
      body: {
        email: usernameToEmail(username),
        password: args.password,
        rememberMe: true,
      },
    });

    const resolvedUsername = normalizeUsername(result.user.name || username);
    await upsertProfile(ctx, resolvedUsername, result.user.id);

    return {
      token: result.token,
      username: resolvedUsername,
    };
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
