import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  xp: integer("xp").default(100).notNull(),
  level: integer("level").default(1).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  membershipPaid: boolean("membership_paid").default(false).notNull(),
  accountNumber: varchar("account_number"),
  phoneNumber: varchar("phone_number"),
  onTimePayments: integer("on_time_payments").default(0).notNull(),
  totalPayments: integer("total_payments").default(0).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  likes: integer("likes").default(0).notNull(),
  dislikes: integer("dislikes").default(0).notNull(),
  xpGained: integer("xp_gained").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postReactions = pgTable("post_reactions", {
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: integer("post_id").notNull().references(() => posts.id),
  type: varchar("type", { length: 10 }).notNull(), // 'like' or 'dislike'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.postId] })
}));

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default('pending').notNull(), // pending, approved, rejected, active, repaid, overdue
  loanPurpose: text("loan_purpose"), // เหตุผลการขอกู้
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"), // หมายเหตุของแอดมิน
  loanTermDays: integer("loan_term_days").default(30), // ระยะเวลากู้ (วัน)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fraudList = pgTable("fraud_list", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  phoneNumber: varchar("phone_number"),
  accountNumber: varchar("account_number"),
  reason: text("reason").notNull(),
  severity: varchar("severity", { length: 10 }).default('medium').notNull(), // low, medium, high
  reportedBy: varchar("reported_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default('pending').notNull(), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value").notNull(),
  description: text("description"), // คำอธิบายการตั้งค่า
  dataType: varchar("data_type", { length: 20 }).default('string'), // string, number, boolean, json
  category: varchar("category", { length: 50 }).default('general'), // general, lending, xp, levels
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // xp_gain, xp_loss, level_up, post_like, etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ระบบแชท
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default('text').notNull(), // text, image, sticker
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ระบบไอเทมตกแต่งและธีม
export const themeItems = pgTable("theme_items", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // background, avatar_frame, chat_bubble, sticker, badge, profile_effect
  itemType: varchar("item_type", { length: 50 }).notNull(), // color, pattern, frame, animated, sparkle
  cssProperties: text("css_properties"), // JSON string with CSS properties
  imageUrl: varchar("image_url"),
  animationData: text("animation_data"), // JSON for animations
  price: integer("price").notNull(), // ราคาใน XP
  rarity: varchar("rarity", { length: 20 }).default('common').notNull(), // common, rare, epic, legendary
  levelRequired: integer("level_required").default(1).notNull(), // ระดับที่ต้องการ
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => themeItems.id),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  isEquipped: boolean("is_equipped").default(false).notNull(),
});

export const userThemes = pgTable("user_themes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  themeData: text("theme_data").notNull(), // JSON string with current theme configuration
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ระบบชำระค่าสมาชิก
export const membershipPayments = pgTable("membership_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default('manual').notNull(),
  status: varchar("status", { length: 20 }).default('pending').notNull(),
  proofImageUrl: varchar("proof_image_url"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  loans: many(loans),
  comments: many(comments),
  postReactions: many(postReactions),
  notifications: many(notifications),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  reactions: many(postReactions),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const loansRelations = relations(loans, ({ one }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  user: one(users, {
    fields: [postReactions.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postReactions.postId],
    references: [posts.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likes: true,
  dislikes: true,
  xpGained: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
  status: true,
  totalAmount: true,
  paidAt: true,
  createdAt: true,
});

export const insertFraudSchema = createInsertSchema(fraudList).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const postReactionSchema = createInsertSchema(postReactions).omit({
  createdAt: true,
});

// Chat schemas
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).omit({
  id: true,
  joinedAt: true,
});

// Theme Item schemas
export const insertThemeItemSchema = createInsertSchema(themeItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserItemSchema = createInsertSchema(userItems).omit({
  id: true,
  purchasedAt: true,
});

export const insertUserThemeSchema = createInsertSchema(userThemes).omit({
  id: true,
  updatedAt: true,
});

// Membership Payment schemas
export const insertMembershipPaymentSchema = createInsertSchema(membershipPayments).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertFraud = z.infer<typeof insertFraudSchema>;
export type Fraud = typeof fraudList.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type PostReaction = z.infer<typeof postReactionSchema>;

// Helper types
export type PostWithUser = Post & {
  user: User;
  reactions: PostReaction[];
  comments: (Comment & { user: User })[];
  userReaction?: PostReaction;
};

// Chat types
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;

// Theme Item types
export type InsertThemeItem = z.infer<typeof insertThemeItemSchema>;
export type ThemeItem = typeof themeItems.$inferSelect;
export type InsertUserItem = z.infer<typeof insertUserItemSchema>;
export type UserItem = typeof userItems.$inferSelect;
export type InsertUserTheme = z.infer<typeof insertUserThemeSchema>;
export type UserTheme = typeof userThemes.$inferSelect;

export type InsertMembershipPayment = z.infer<typeof insertMembershipPaymentSchema>;
export type MembershipPayment = typeof membershipPayments.$inferSelect;

// Extended types with relations
export type ChatMessageWithUser = ChatMessage & {
  user: User;
};

export type ChatRoomWithParticipants = ChatRoom & {
  participants: (ChatParticipant & { user: User })[];
  messages: ChatMessageWithUser[];
  lastMessage?: ChatMessageWithUser;
};

export type UserItemWithTheme = UserItem & {
  item: ThemeItem;
};

export type UserWithStats = User & {
  posts: Post[];
  loans: Loan[];
  availableCredit: number;
  outstandingDebt: number;
  interestRate: number;
  ownedItems: UserItemWithTheme[];
  currentTheme: UserTheme | null;
};
