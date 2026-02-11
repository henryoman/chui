import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    username: v.string(),
    email: v.optional(v.string()),
    authUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_auth_user_id", ["authUserId"]),

  messages: defineTable({
    profileId: v.id("profiles"),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_profile_id_created_at", ["profileId", "createdAt"]),

  conversations: defineTable({
    kind: v.literal("direct"),
    dmKey: v.string(),
    createdBy: v.id("profiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
    lastMessageSenderId: v.optional(v.id("profiles")),
  })
    .index("by_dm_key", ["dmKey"])
    .index("by_updated_at", ["updatedAt"]),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("profiles"),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_user_and_conversation", ["userId", "conversationId"])
    .index("by_conversation_and_user", ["conversationId", "userId"])
    .index("by_user_and_joined_at", ["userId", "joinedAt"])
    .index("by_conversation", ["conversationId"]),

  conversationMessages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("profiles"),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_conversation_and_created_at", ["conversationId", "createdAt"])
    .index("by_sender_and_created_at", ["senderId", "createdAt"]),
});
