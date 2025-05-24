import {
  users,
  posts,
  comments,
  loans,
  fraudList,
  friendships,
  notifications,
  postReactions,
  systemSettings,
  chatRooms,
  chatMessages,
  chatParticipants,
  themeItems,
  userItems,
  userThemes,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type PostWithUser,
  type InsertComment,
  type Comment,
  type InsertLoan,
  type Loan,
  type InsertFraud,
  type Fraud,
  type InsertFriendship,
  type Friendship,
  type InsertNotification,
  type Notification,
  type PostReaction,
  type UserWithStats,
  type ChatRoom,
  type InsertChatRoom,
  type ChatRoomWithParticipants,
  type ChatMessage,
  type InsertChatMessage,
  type ChatMessageWithUser,
  type ChatParticipant,
  type InsertChatParticipant,
  type ThemeItem,
  type InsertThemeItem,
  type UserItem,
  type InsertUserItem,
  type UserItemWithTheme,
  type UserTheme,
  type InsertUserTheme,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, asc, ne } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // User management
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  updateUserXP(userId: string, xpChange: number): Promise<User>;
  updateUserLevel(userId: string): Promise<User>;
  banUser(userId: string, banned: boolean): Promise<User>;

  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<PostWithUser[]>;
  getPostById(id: number): Promise<PostWithUser | undefined>;
  deletePost(id: number, userId: string): Promise<boolean>;

  // Post reactions
  togglePostReaction(userId: string, postId: number, type: 'like' | 'dislike'): Promise<{ added: boolean; reaction?: PostReaction }>;
  getUserPostReaction(userId: string, postId: number): Promise<PostReaction | undefined>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<(Comment & { user: User })[]>;

  // Loans
  createLoan(loan: InsertLoan): Promise<Loan>;
  getLoansByUser(userId: string): Promise<Loan[]>;
  getActiveLoansByUser(userId: string): Promise<Loan[]>;
  getAllLoans(limit?: number, offset?: number): Promise<Loan[]>;
  getLoanById(id: number): Promise<Loan | undefined>;
  updateLoanStatus(id: number, status: string, adminId: string, paidAt?: Date): Promise<Loan>;
  approveLoan(id: number, adminId: string, notes?: string): Promise<Loan>;
  rejectLoan(id: number, adminId: string, reason: string): Promise<Loan>;
  calculateLoanTerms(userId: string, amount: number, termDays?: number): Promise<{
    interestRate: number;
    totalAmount: number;
    maxAmount: number;
    termDays: number;
  }>;

  // Fraud check
  createFraudEntry(fraud: InsertFraud): Promise<Fraud>;
  searchFraud(searchTerm: string): Promise<Fraud[]>;
  getFraudList(limit?: number): Promise<Fraud[]>;

  // Friends
  createFriendRequest(friendship: InsertFriendship): Promise<Friendship>;
  getFriends(userId: string): Promise<User[]>;
  getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]>;
  updateFriendshipStatus(id: number, status: string): Promise<Friendship>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<boolean>;

  // System settings
  getSystemSetting(key: string): Promise<string | undefined>;
  setSystemSetting(key: string, value: string): Promise<void>;

  // Chat functions
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatRooms(userId: string): Promise<ChatRoomWithParticipants[]>;
  getChatMessages(roomId: number, limit?: number): Promise<ChatMessageWithUser[]>;
  sendMessage(message: InsertChatMessage): Promise<ChatMessage>;
  joinChatRoom(roomId: number, userId: string): Promise<ChatParticipant>;

  // Theme Shop functions
  getShopItems(category?: string): Promise<ThemeItem[]>;
  getUserItems(userId: string): Promise<UserItemWithTheme[]>;
  purchaseItem(userId: string, itemId: number): Promise<UserItem>;
  equipItem(userId: string, itemId: number): Promise<UserItem>;
  createThemeItem(item: InsertThemeItem): Promise<ThemeItem>;

  // Admin functions
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getSystemStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalLoans: number;
    activeLoans: number;
  }>;
}

// Mock cache object (replace with your actual cache implementation)
const cache = {
  del: (key: string) => {
    console.log(`Cache cleared for key: ${key}`);
  },
};

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const userPosts = await db.select().from(posts).where(eq(posts.userId, id));
    const userLoans = await db.select().from(loans).where(eq(loans.userId, id));

    const activeLoans = userLoans.filter(loan => loan.status === 'approved');
    const outstandingDebt = activeLoans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0);

    // Calculate credit limit based on level
    const baseCreditLimit = 10000;
    const levelMultiplier = user.level;
    const maxCredit = baseCreditLimit * levelMultiplier;
    const availableCredit = Math.max(0, maxCredit - outstandingDebt);

    // Calculate interest rate based on level
    const interestRates = { 1: 5, 2: 3, 3: 2, 4: 1 };
    const interestRate = interestRates[user.level as keyof typeof interestRates] || 5;

    // ดึงไอเทมที่ผู้ใช้มี
    const ownedItems = await db
      .select({
        id: userItems.id,
        itemId: userItems.itemId,
        userId: userItems.userId,
        isEquipped: userItems.isEquipped,
        purchasedAt: userItems.purchasedAt,
        item: themeItems,
      })
      .from(userItems)
      .leftJoin(themeItems, eq(userItems.itemId, themeItems.id))
      .where(eq(userItems.userId, id));

    // ดึงธีมปัจจุบัน
    const [currentTheme] = await db
      .select()
      .from(userThemes)
      .where(eq(userThemes.userId, id))
      .limit(1);

    return {
      ...user,
      posts: userPosts,
      loans: userLoans,
      availableCredit,
      outstandingDebt,
      interestRate,
      ownedItems: ownedItems as UserItemWithTheme[],
      currentTheme: currentTheme || null,
    };
  }

  async updateUserXP(userId: string, xpChange: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        xp: sql`${users.xp} + ${xpChange}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Check for level up
    await this.updateUserLevel(userId);
    return user;
  }

  async updateUserLevel(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');

    let newLevel = 1;
    if (user.xp >= 3000) newLevel = 4;
    else if (user.xp >= 1500) newLevel = 3;
    else if (user.xp >= 500) newLevel = 2;

    if (newLevel > user.level) {
      // Level up!
      const [updatedUser] = await db
        .update(users)
        .set({ level: newLevel, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      // Create level up notification
      await this.createNotification({
        userId,
        type: 'level_up',
        title: 'Level Up!',
        message: `Congratulations! You've reached Level ${newLevel}`,
        data: { newLevel, oldLevel: user.level }
      });

      return updatedUser;
    }

    return user;
  }

  async banUser(userId: string, banned: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: banned, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Posts
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();

    // Deduct XP for posting
    await this.updateUserXP(post.userId, -5);

    // Create notification for user
    await this.createNotification({
      userId: post.userId,
      type: 'post_created',
      title: 'Post Created',
      message: 'Your post has been published. You used 5 XP.',
      data: { postId: newPost.id, xpChange: -5 }
    });

    return newPost;
  }

  async getPosts(limit = 20, offset = 0): Promise<PostWithUser[]> {
    const result = await db
      .select({
        post: posts,
        user: users,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const postsWithDetails = await Promise.all(
      result.map(async ({ post, user }) => {
        const reactions = await db
          .select()
          .from(postReactions)
          .where(eq(postReactions.postId, post.id));

        const commentsWithUsers = await db
          .select({
            comment: comments,
            user: users,
          })
          .from(comments)
          .leftJoin(users, eq(comments.userId, users.id))
          .where(eq(comments.postId, post.id))
          .orderBy(asc(comments.createdAt));

        return {
          ...post,
          user: user!,
          reactions,
          comments: commentsWithUsers.map(({ comment, user }) => ({
            ...comment,
            user: user!,
          })),
        };
      })
    );

    return postsWithDetails;
  }

  async getPostById(id: number): Promise<PostWithUser | undefined> {
    const result = await db
      .select({
        post: posts,
        user: users,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id));

    if (result.length === 0) return undefined;

    const { post, user } = result[0];

    const reactions = await db
      .select()
      .from(postReactions)
      .where(eq(postReactions.postId, post.id));

    const commentsWithUsers = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, post.id))
      .orderBy(asc(comments.createdAt));

    return {
      ...post,
      user: user!,
      reactions,
      comments: commentsWithUsers.map(({ comment, user }) => ({
        ...comment,
        user: user!,
      })),
    };
  }

  async deletePost(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();

    // Clear cache after deleting post
    const cacheKey = `posts:${id}`;
    cache.del(cacheKey);

    return result.length > 0;
  }

  // Post reactions
  async togglePostReaction(userId: string, postId: number, type: 'like' | 'dislike'): Promise<{ added: boolean; reaction?: PostReaction }> {
    // Check if reaction already exists
    const existingReaction = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)));

    if (existingReaction.length > 0) {
      // Remove existing reaction
      await db
        .delete(postReactions)
        .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)));

      // Update post counts
      const updateField = existingReaction[0].type === 'like' ? 'likes' : 'dislikes';
      await db
        .update(posts)
        .set({ [updateField]: sql`${posts[updateField]} - 1` })
        .where(eq(posts.id, postId));

      return { added: false };
    } else {
      // Add new reaction
      const [reaction] = await db
        .insert(postReactions)
        .values({ userId, postId, type })
        .returning();

      // Update post counts
      const updateField = type === 'like' ? 'likes' : 'dislikes';
      await db
        .update(posts)
        .set({ [updateField]: sql`${posts[updateField]} + 1` })
        .where(eq(posts.id, postId));

      // Update XP
      const post = await db.select().from(posts).where(eq(posts.id, postId));
      if (post.length > 0) {
        const postOwner = post[0].userId;

        if (type === 'like') {
          // Liker loses 1 XP, post owner gains 1 XP
          await this.updateUserXP(userId, -1);
          await this.updateUserXP(postOwner, 1);

          await this.createNotification({
            userId: postOwner,
            type: 'post_like',
            title: 'Your post was liked!',
            message: 'Someone liked your post. You gained 1 XP!',
            data: { postId, xpChange: 1 }
          });
        } else {
          // Disliker loses 2 XP, post owner loses 5 XP
          await this.updateUserXP(userId, -2);
          await this.updateUserXP(postOwner, -5);

          await this.createNotification({
            userId: postOwner,
            type: 'post_dislike',
            title: 'Your post was disliked',
            message: 'Your post received a dislike. You lost 5 XP.',
            data: { postId, xpChange: -5 }
          });
        }
      }

      return { added: true, reaction };
    }
  }

  async getUserPostReaction(userId: string, postId: number): Promise<PostReaction | undefined> {
    const [reaction] = await db
      .select()
      .from(postReactions)
      .where(and(eq(postReactions.userId, userId), eq(postReactions.postId, postId)));

    return reaction;
  }

  // Comments
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select({
        comment: comments,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));

    return result.map(({ comment, user }) => ({
      ...comment,
      user: user!,
    }));
  }

  // Loans
  async createLoan(loan: InsertLoan): Promise<Loan> {
    // คำนวณเงื่อนไขการกู้ตามระดับผู้ใช้
    const terms = await this.calculateLoanTerms(loan.userId, Number(loan.amount), loan.loanTermDays);

    const loanData = {
      ...loan,
      interestRate: terms.interestRate.toString(),
      totalAmount: terms.totalAmount.toString(),
      loanTermDays: terms.termDays,
      dueDate: new Date(Date.now() + terms.termDays * 24 * 60 * 60 * 1000),
      status: 'pending'
    };

    const [newLoan] = await db
      .insert(loans)
      .values(loanData)
      .returning();

    return newLoan;
  }

  async calculateLoanTerms(userId: string, amount: number, termDays: number = 30): Promise<{
    interestRate: number;
    totalAmount: number;
    maxAmount: number;
    termDays: number;
  }> {
    const userWithStats = await this.getUserWithStats(userId);
    if (!userWithStats) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    // ดึงการตั้งค่าระบบ (สามารถปรับแต่งได้โดยแอดมิน)
    const maxAmountSetting = await this.getSystemSetting(`max_loan_level_${userWithStats.level}`) || userWithStats.availableCredit.toString();
    const interestRateSetting = await this.getSystemSetting(`interest_rate_level_${userWithStats.level}`) || userWithStats.interestRate.toString();
    const maxTermDaysSetting = await this.getSystemSetting('max_loan_term_days') || '90';
    const minTermDaysSetting = await this.getSystemSetting('min_loan_term_days') || '7';

    const maxAmount = parseFloat(maxAmountSetting);
    const interestRate = parseFloat(interestRateSetting);
    const maxTermDays = parseInt(maxTermDaysSetting);
    const minTermDays = parseInt(minTermDaysSetting);

    // ตรวจสอบเงื่อนไข
    if (amount > maxAmount) {
      throw new Error(`จำนวนเงินเกินวงเงินสูงสุด ${maxAmount.toLocaleString()} บาท`);
    }

    if (termDays > maxTermDays) {
      termDays = maxTermDays;
    }
    if (termDays < minTermDays) {
      termDays = minTermDays;
    }

    // คำนวณยอดรวมที่ต้องชำระ
    const totalAmount = amount * (1 + (interestRate / 100));

    return {
      interestRate,
      totalAmount,
      maxAmount,
      termDays
    };
  }

  async getAllLoans(limit: number = 50, offset: number = 0): Promise<Loan[]> {
    const allLoans = await db
      .select()
      .from(loans)
      .orderBy(desc(loans.createdAt))
      .limit(limit)
      .offset(offset);

    return allLoans;
  }

  async getLoanById(id: number): Promise<Loan | undefined> {
    const [loan] = await db
      .select()
      .from(loans)
      .where(eq(loans.id, id));

    return loan;
  }

  async approveLoan(id: number, adminId: string, notes?: string): Promise<Loan> {
    const now = new Date();
    const [loan] = await db
      .update(loans)
      .set({
        status: 'approved',
        approvedAt: now,
        approvedBy: adminId,
        adminNotes: notes || null
      })
      .where(eq(loans.id, id))
      .returning();

    if (!loan) {
      throw new Error("ไม่พบข้อมูลเงินกู้");
    }

    // สร้างการแจ้งเตือนให้ผู้ใช้
    await this.createNotification({
      userId: loan.userId,
      type: 'loan_approved',
      title: 'คำขอกู้เงินได้รับการอนุมัติ',
      message: `คำขอกู้เงิน ${Number(loan.amount).toLocaleString()} บาท ได้รับการอนุมัติแล้ว`
    });

    return loan;
  }

  async rejectLoan(id: number, adminId: string, reason: string): Promise<Loan> {
    const now = new Date();
    const [loan] = await db
      .update(loans)
      .set({
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: adminId,
        rejectionReason: reason
      })
      .where(eq(loans.id, id))
      .returning();

    if (!loan) {
      throw new Error("ไม่พบข้อมูลเงินกู้");
    }

    // สร้างการแจ้งเตือนให้ผู้ใช้
    await this.createNotification({
      userId: loan.userId,
      type: 'loan_rejected',
      title: 'คำขอกู้เงินถูกปฏิเสธ',
      message: `คำขอกู้เงิน ${Number(loan.amount).toLocaleString()} บาท ถูกปฏิเสธ เหตุผล: ${reason}`
    });

    return loan;
  }

  async getLoansByUser(userId: string): Promise<Loan[]> {
    const userLoans = await db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.createdAt));

    return userLoans;
  }

  async getActiveLoansByUser(userId: string): Promise<Loan[]> {
    const activeLoans = await db
      .select()
      .from(loans)
      .where(and(eq(loans.userId, userId), eq(loans.status, 'approved')))
      .orderBy(desc(loans.createdAt));

    return activeLoans;
  }

  async updateLoanStatus(id: number, status: string, adminId: string, paidAt?: Date): Promise<Loan> {
    const updateData: any = { status };
    if (paidAt) updateData.paidAt = paidAt;

    const [loan] = await db
      .update(loans)
      .set(updateData)
      .where(eq(loans.id, id))
      .returning();

    // If loan is repaid on time, update user stats
    if (status === 'repaid' && paidAt) {
      const loanData = await db.select().from(loans).where(eq(loans.id, id));
      if (loanData.length > 0) {
        const loan = loanData[0];
        const isOnTime = paidAt <= loan.dueDate;

        if (isOnTime) {
          await db
            .update(users)
            .set({ 
              onTimePayments: sql`${users.onTimePayments} + 1`,
              totalPayments: sql`${users.totalPayments} + 1`
            })
            .where(eq(users.id, loan.userId));
        } else {
          await db
            .update(users)
            .set({ 
              totalPayments: sql`${users.totalPayments} + 1`
            })
            .where(eq(users.id, loan.userId));
        }
      }
    }

    return loan;
  }

  // Fraud check
  async createFraudEntry(fraud: InsertFraud): Promise<Fraud> {
    const [newFraud] = await db.insert(fraudList).values(fraud).returning();
    return newFraud;
  }

  async searchFraud(searchTerm: string): Promise<Fraud[]> {
    const results = await db
      .select()
      .from(fraudList)
      .where(
        or(
          sql`${fraudList.name} ILIKE ${`%${searchTerm}%`}`,
          sql`${fraudList.phoneNumber} ILIKE ${`%${searchTerm}%`}`,
          sql`${fraudList.accountNumber} ILIKE ${`%${searchTerm}%`}`
        )
      )
      .orderBy(desc(fraudList.createdAt));

    return results;
  }

  async getFraudList(limit = 50): Promise<Fraud[]> {
    const results = await db
      .select()
      .from(fraudList)
      .orderBy(desc(fraudList.createdAt))
      .limit(limit);

    return results;
  }

  // Friends
  async createFriendRequest(friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db.insert(friendships).values(friendship).returning();

    // Create notification for addressee
    await this.createNotification({
      userId: friendship.addresseeId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'You have received a new friend request',
      data: { friendshipId: newFriendship.id }
    });

    return newFriendship;
  }

  async getFriends(userId: string): Promise<User[]> {
    const friendships = await db
      .select({
        friendship: friendships,
        friend: users,
      })
      .from(friendships)
      .leftJoin(users, or(
        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, users.id)),
        and(eq(friendships.addresseeId, userId), eq(friendships.requesterId, users.id))
      ))
      .where(
        and(
          eq(friendships.status, 'accepted'),
          or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
          ne(users.id, userId)
        )
      );

    return friendships.map(({ friend }) => friend!);
  }

  async getFriendRequests(userId: string): Promise<(Friendship & { requester: User })[]> {
    const requests = await db
      .select({
        friendship: friendships,
        requester: users,
      })
      .from(friendships)
      .leftJoin(users, eq(friendships.requesterId, users.id))
      .where(
        and(
          eq(friendships.addresseeId, userId),
          eq(friendships.status, 'pending')
        )
      )
      .orderBy(desc(friendships.createdAt));

    return requests.map(({ friendship, requester }) => ({
      ...friendship,
      requester: requester!,
    }));
  }

  async updateFriendshipStatus(id: number, status: string): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status })
      .where(eq(friendships.id, id))
      .returning();

    if (status === 'accepted') {
      // Create notification for requester
      await this.createNotification({
        userId: friendship.requesterId,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: 'Your friend request has been accepted!',
        data: { friendshipId: id }
      });
    }

    return friendship;
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return userNotifications;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();

    return result.length > 0;
  }

  // System settings
  async getSystemSetting(key: string): Promise<string | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));

    return setting?.value;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  // Admin functions
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return allUsers;
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalPosts: number;
    totalLoans: number;
    activeLoans: number;
  }> {
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [postsCount] = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const [loansCount] = await db.select({ count: sql<number>`count(*)` }).from(loans);
    const [activeLoansCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(loans)
      .where(eq(loans.status, 'approved'));

    return {
      totalUsers: usersCount.count,
      totalPosts: postsCount.count,
      totalLoans: loansCount.count,
      activeLoans: activeLoansCount.count,
    };
  }

  // ฟังก์ชันแชท
  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [newRoom] = await db.insert(chatRooms).values(room).returning();
    return newRoom;
  }

  async getChatRooms(userId: string): Promise<ChatRoomWithParticipants[]> {
    const rooms = await db
      .select({
        id: chatRooms.id,
        name: chatRooms.name,
        isPrivate: chatRooms.isPrivate,
        createdAt: chatRooms.createdAt,
        createdBy: chatRooms.createdBy,
      })
      .from(chatRooms)
      .leftJoin(chatParticipants, eq(chatRooms.id, chatParticipants.roomId))
      .where(eq(chatParticipants.userId, userId));

    const roomsWithParticipants = await Promise.all(
      rooms.map(async (room) => {
        const participants = await db
          .select({
            id: chatParticipants.id,
            roomId: chatParticipants.roomId,
            userId: chatParticipants.userId,
            joinedAt: chatParticipants.joinedAt,
            user: users,
          })
          .from(chatParticipants)
          .leftJoin(users, eq(chatParticipants.userId, users.id))
          .where(eq(chatParticipants.roomId, room.id));

        const messages = await db
          .select({
            id: chatMessages.id,
            roomId: chatMessages.roomId,
            userId: chatMessages.userId,
            content: chatMessages.content,
            createdAt: chatMessages.createdAt,
            user: users,
          })
          .from(chatMessages)
          .leftJoin(users, eq(chatMessages.userId, users.id))
          .where(eq(chatMessages.roomId, room.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(1);

        return {
          ...room,
          participants,
          messages: [],
          lastMessage: messages[0] || undefined,
        } as ChatRoomWithParticipants;
      })
    );

    return roomsWithParticipants;
  }

  async getChatMessages(roomId: number, limit = 50): Promise<ChatMessageWithUser[]> {
    const messages = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit);

    return messages as ChatMessageWithUser[];
  }  async sendMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async joinChatRoom(roomId: number, userId: string): Promise<ChatParticipant> {
    const [participant] = await db
      .insert(chatParticipants)
      .values({ roomId, userId })
      .returning();
    return participant;
  }

  // ฟังก์ชันร้านค้าไอเทม
  async getShopItems(category?: string): Promise<ThemeItem[]> {
    let query = db.select().from(themeItems);

    if (category && category !== 'all') {
      query = query.where(eq(themeItems.category, category));
    }

    return await query.orderBy(themeItems.price);
  }

  async getUserItems(userId: string): Promise<UserItemWithTheme[]> {
    const items = await db
      .select({
        id: userItems.id,
        itemId: userItems.itemId,
        userId: userItems.userId,
        isEquipped: userItems.isEquipped,
        purchasedAt: userItems.purchasedAt,
        item: themeItems,
      })
      .from(userItems)
      .leftJoin(themeItems, eq(userItems.itemId, themeItems.id))
      .where(eq(userItems.userId, userId));

    return items as UserItemWithTheme[];
  }

  async purchaseItem(userId: string, itemId: number): Promise<UserItem> {
    // ตรวจสอบว่ามีไอเทมอยู่หรือไม่
    const [item] = await db.select().from(themeItems).where(eq(themeItems.id, itemId));
    if (!item) throw new Error('ไม่พบไอเทมนี้');

    // ตรวจสอบว่าผู้ใช้มีไอเทมนี้แล้วหรือไม่
    const [existingItem] = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));

    if (existingItem) throw new Error('คุณมีไอเทมนี้แล้ว');

    // ตรวจสอบ XP และระดับของผู้ใช้
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('ไม่พบผู้ใช้');

    if (user.xp < item.price) throw new Error('XP ไม่เพียงพอ');
    if (user.level < item.levelRequired) throw new Error('ระดับไม่เพียงพอ');

    // หัก XP และซื้อไอเทม
    await db
      .update(users)
      .set({ xp: user.xp - item.price })
      .where(eq(users.id, userId));

    const [purchasedItem] = await db
      .insert(userItems)
      .values({ userId, itemId })
      .returning();

    return purchasedItem;
  }

  async equipItem(userId: string, itemId: number): Promise<UserItem> {
    // ตรวจสอบว่าผู้ใช้มีไอเทมนี้หรือไม่
    const [userItem] = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, userId), eq(userItems.itemId, itemId)));

    if (!userItem) throw new Error('คุณไม่มีไอเทมนี้');

    // ปิดการใช้งานไอเทมอื่นในหมวดเดียวกัน
    const [item] = await db.select().from(themeItems).where(eq(themeItems.id, itemId));
    if (item) {
      await db
        .update(userItems)
        .set({ isEquipped: false })
        .where(
          and(
            eq(userItems.userId, userId),
            sql`${userItems.itemId} IN (SELECT id FROM ${themeItems} WHERE category = ${item.category})`
          )
        );
    }

    // ใช้งานไอเทมใหม่
    const [equippedItem] = await db
      .update(userItems)
      .set({ isEquipped: true })
      .where(eq(userItems.id, userItem.id))
      .returning();

    return equippedItem;
  }

  async createThemeItem(item: InsertThemeItem): Promise<ThemeItem> {
    const [newItem] = await db.insert(themeItems).values(item).returning();
    return newItem;
  }
}

export const storage = new DatabaseStorage();