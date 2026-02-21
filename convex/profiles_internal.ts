import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { parseUsernameOrThrow, USERNAME_RULES_TEXT } from "../shared/username";

export const upsertProfileInternal = internalMutation({
  args: {
    username: v.string(),
    authUserId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const username = parseUsernameOrThrow(args.username, `Username: ${USERNAME_RULES_TEXT}`);
    const now = Date.now();
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: now,
        authUserId: args.authUserId ?? existing.authUserId,
        ...(args.email !== undefined && { email: args.email }),
      });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      username,
      authUserId: args.authUserId,
      email: args.email,
      createdAt: now,
      updatedAt: now,
    });
  },
});
