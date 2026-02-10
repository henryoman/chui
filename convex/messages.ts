import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_auth_user_id", (q) =>
        q.eq("authUserId", identity.subject),
      )
      .unique();

    if (!profile) {
      throw new Error("Profile not found for current user");
    }

    const createdAt = Date.now();
    const messageId = await ctx.db.insert("messages", {
      profileId: profile._id,
      body: args.body.trim(),
      createdAt,
    });

    return { messageId, createdAt };
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);

    return await Promise.all(
      messages.map(async (message) => {
        const profile = await ctx.db.get(message.profileId);
        return {
          ...message,
          username: profile?.username ?? "unknown",
        };
      }),
    );
  },
});
