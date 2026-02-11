import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const USERNAME_RE = /^[a-z0-9]{3,20}$/;

const normalizeUsername = (raw: string) => raw.trim().toLowerCase();

const requireValidUsername = (rawUsername: string) => {
  const username = normalizeUsername(rawUsername);
  if (!USERNAME_RE.test(username)) {
    throw new Error("Username: 3-20 letters/numbers, case insensitive");
  }
  return username;
};

type AuthDbCtx = Pick<QueryCtx, "auth" | "db"> | Pick<MutationCtx, "auth" | "db">;

const requireCurrentProfile = async (ctx: AuthDbCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_auth_user_id", (q) => q.eq("authUserId", identity.subject))
    .unique();

  if (!profile) {
    throw new Error("Profile not found for current user");
  }

  return profile;
};

const dmKeyFor = (a: Id<"profiles">, b: Id<"profiles">) => {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
};

const ensureMember = async (
  ctx: MutationCtx,
  conversationId: Id<"conversations">,
  userId: Id<"profiles">,
  joinedAt: number,
) => {
  const existing = await ctx.db
    .query("conversationMembers")
    .withIndex("by_conversation_and_user", (q) =>
      q.eq("conversationId", conversationId).eq("userId", userId),
    )
    .unique();

  if (!existing) {
    await ctx.db.insert("conversationMembers", {
      conversationId,
      userId,
      joinedAt,
    });
  }
};

const sendDirectMessageInternal = async (
  ctx: MutationCtx,
  args: { toUsername: string; body: string },
) => {
  const sender = await requireCurrentProfile(ctx);
  const toUsername = requireValidUsername(args.toUsername);
  const body = args.body.trim();
  if (!body) {
    throw new Error("Message body is required");
  }

  const recipient = await ctx.db
    .query("profiles")
    .withIndex("by_username", (q) => q.eq("username", toUsername))
    .unique();
  if (!recipient) {
    throw new Error("Recipient not found");
  }
  if (recipient._id === sender._id) {
    throw new Error("Cannot message yourself");
  }

  const now = Date.now();
  const dmKey = dmKeyFor(sender._id, recipient._id);
  const existingConversation = await ctx.db
    .query("conversations")
    .withIndex("by_dm_key", (q) => q.eq("dmKey", dmKey))
    .unique();

  const conversationId = existingConversation
    ? existingConversation._id
    : await ctx.db.insert("conversations", {
        kind: "direct",
        dmKey,
        createdBy: sender._id,
        createdAt: now,
        updatedAt: now,
      });

  await ensureMember(ctx, conversationId, sender._id, now);
  await ensureMember(ctx, conversationId, recipient._id, now);

  const messageId = await ctx.db.insert("conversationMessages", {
    conversationId,
    senderId: sender._id,
    body,
    createdAt: now,
  });

  await ctx.db.patch(conversationId, {
    updatedAt: now,
    lastMessageAt: now,
    lastMessageSenderId: sender._id,
    lastMessagePreview: body.slice(0, 140),
  });

  return {
    conversationId,
    messageId,
    createdAt: now,
  };
};

export const sendDirectMessage = mutation({
  args: {
    toUsername: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendDirectMessageInternal(ctx, args);
  },
});

export const sendMessage = mutation({
  args: {
    toUsername: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendDirectMessageInternal(ctx, args);
  },
});

export const listMyConversations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await requireCurrentProfile(ctx);
    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100);

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_user_and_joined_at", (q) => q.eq("userId", me._id))
      .collect();

    const summaries = await Promise.all(
      memberships.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) return null;

        const members = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .collect();
        const otherMember = members.find((m) => m.userId !== me._id);
        const otherProfile = otherMember
          ? await ctx.db.get(otherMember.userId)
          : null;

        return {
          conversationId: conversation._id,
          updatedAt: conversation.updatedAt,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          otherUser: otherProfile
            ? {
                userId: otherProfile._id,
                username: otherProfile.username,
              }
            : null,
        };
      }),
    );

    return summaries
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => (b.lastMessageAt ?? b.updatedAt) - (a.lastMessageAt ?? a.updatedAt))
      .slice(0, limit);
  },
});

export const listConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const me = await requireCurrentProfile(ctx);
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversation_and_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", me._id),
      )
      .unique();
    if (!membership) {
      throw new Error("Conversation not found");
    }

    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_conversation_and_created_at", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(limit);

    const hydrated = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderUsername: sender?.username ?? "unknown",
        };
      }),
    );

    return hydrated.reverse();
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100);

    const messages = await ctx.db
      .query("conversationMessages")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    return await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          username: sender?.username ?? "unknown",
        };
      }),
    );
  },
});
