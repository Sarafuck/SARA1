import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { errorHandler, AppError } from "./errorHandler";
import { loginLimiter, loanLimiter, defaultLimiter } from "./rateLimit";
import { createClient } from 'redis';
import NodeCache from 'node-cache';

// In-memory cache for development
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL
import { 
  insertPostSchema, 
  insertCommentSchema, 
  insertLoanSchema, 
  insertFraudSchema,
  insertFriendshipSchema,
  postReactionSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // WebSocket setup for real-time features
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  
  // Store WebSocket connections by user ID
  const connections = new Map<string, any>();

  wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'auth' && data.userId) {
          connections.set(data.userId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove connection
      for (const [userId, connection] of connections) {
        if (connection === ws) {
          connections.delete(userId);
          break;
        }
      }
    });
  });

  // Broadcast notification to user
  function notifyUser(userId: string, notification: any) {
    const ws = connections.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res, next) => {
    try {
      const userId = req.user.claims.sub;
      const cacheKey = `user:${userId}`;
      
      // Check cache first
      const cachedUser = cache.get(cacheKey);
      if (cachedUser) {
        return res.json(cachedUser);
      }

      const user = await storage.getUserWithStats(userId);
      if (!user) {
        throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
      }

      // Cache for 5 minutes
      cache.set(cacheKey, user, 300);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Add rate limiting to login
  app.get('/api/login', loginLimiter, (req, res) => {
    // ... existing login logic
  });

  // Posts routes
  app.get('/api/posts', isAuthenticated, defaultLimiter, async (req: any, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
      const offset = (page - 1) * limit;
      
      const [posts, total] = await Promise.all([
        storage.getPosts(limit, offset),
        storage.getPostsCount()
      ]);
      
      // Add user reaction for each post
      const userId = req.user.claims.sub;
      const postsWithUserReactions = await Promise.all(
        posts.map(async (post) => {
          const userReaction = await storage.getUserPostReaction(userId, post.id);
          return { ...post, userReaction };
        })
      );
      
      res.json(postsWithUserReactions);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.isBanned) {
        return res.status(403).json({ message: "User is banned or not found" });
      }

      if (user.xp < 5) {
        return res.status(400).json({ message: "Insufficient XP to create post" });
      }

      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      
      // Notify user about XP change
      notifyUser(userId, {
        type: 'xp_change',
        title: 'Post Created',
        message: 'You used 5 XP to create a post',
        xpChange: -5
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/posts/:id/react', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const { type } = postReactionSchema.parse(req.body);
      
      const result = await storage.togglePostReaction(userId, postId, type);
      
      // Get updated post data
      const post = await storage.getPostById(postId);
      if (post) {
        // Notify post owner if it's a like
        if (result.added && type === 'like' && post.userId !== userId) {
          notifyUser(post.userId, {
            type: 'post_like',
            title: 'Your post was liked!',
            message: 'Someone liked your post. You gained 1 XP!',
            xpChange: 1
          });
        }
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error reacting to post:", error);
      res.status(500).json({ message: "Failed to react to post" });
    }
  });

  app.delete('/api/posts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      const deleted = await storage.deletePost(postId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found or unauthorized" });
      }

      // Clear related caches
      cache.del(`posts:${postId}`);
      cache.del('posts:list');
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Comments routes
  app.post('/api/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
        postId
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Loans routes
  app.get('/api/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loans = await storage.getLoansByUser(userId);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  // คำนวณเงื่อนไขการกู้
  app.post('/api/loans/calculate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, termDays } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "จำนวนเงินไม่ถูกต้อง" });
      }

      const terms = await storage.calculateLoanTerms(userId, amount, termDays);
      res.json(terms);
    } catch (error) {
      console.error("Error calculating loan terms:", error);
      res.status(400).json({ message: error.message || "ไม่สามารถคำนวณเงื่อนไขได้" });
    }
  });

  app.post('/api/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithStats(userId);
      
      if (!user || !user.membershipPaid) {
        return res.status(403).json({ message: "ต้องชำระค่าสมาชิกก่อน" });
      }

      const { amount, loanTermDays, loanPurpose } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "จำนวนเงินไม่ถูกต้อง" });
      }

      if (amount > user.availableCredit) {
        return res.status(400).json({ message: "จำนวนเงินเกินวงเงินที่ได้รับ" });
      }

      // ตรวจสอบจำนวนเงินกู้ที่ยังไม่ชำระ
      const activeLoans = await storage.getActiveLoansByUser(userId);
      const maxActiveLoans = parseInt(await storage.getSystemSetting('max_active_loans') || '3');
      
      if (activeLoans.length >= maxActiveLoans) {
        return res.status(400).json({ message: `คุณมีเงินกู้ที่ยังไม่ชำระครบ ${maxActiveLoans} รายการแล้ว` });
      }

      const loanData = {
        userId,
        amount: amount.toString(),
        loanTermDays: loanTermDays || 30,
        loanPurpose: loanPurpose || ''
      };
      
      const loan = await storage.createLoan(loanData);
      
      // สร้างการแจ้งเตือน
      await storage.createNotification({
        userId,
        type: 'loan_requested',
        title: 'ส่งคำขอกู้เงินแล้ว',
        message: `คำขอกู้เงิน ${amount.toLocaleString()} บาท อยู่ระหว่างการพิจารณา`
      });

      res.status(201).json(loan);
    } catch (error) {
      console.error("Error creating loan:", error);
      res.status(400).json({ message: error.message || "ไม่สามารถสร้างคำขอกู้เงินได้" });
    }
  });

  app.patch('/api/loans/:id/repay', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const loanId = parseInt(req.params.id);
      
      // Verify loan belongs to user
      const loans = await storage.getLoansByUser(userId);
      const loan = loans.find(l => l.id === loanId);
      
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }

      if (loan.status !== 'approved') {
        return res.status(400).json({ message: "Loan is not active" });
      }

      const updatedLoan = await storage.updateLoanStatus(loanId, 'repaid', new Date());
      
      // Check if payment was on time and update user level
      const isOnTime = new Date() <= loan.dueDate;
      if (isOnTime) {
        await storage.updateUserLevel(userId);
        notifyUser(userId, {
          type: 'loan_repaid',
          title: 'Loan Repaid On Time!',
          message: 'Great job! Your on-time payment helps improve your level.',
          onTime: true
        });
      } else {
        notifyUser(userId, {
          type: 'loan_repaid',
          title: 'Loan Repaid',
          message: 'Your loan has been repaid, but it was late.',
          onTime: false
        });
      }
      
      res.json(updatedLoan);
    } catch (error) {
      console.error("Error repaying loan:", error);
      res.status(500).json({ message: "Failed to repay loan" });
    }
  });

  // Fraud check routes
  app.get('/api/fraud/search', isAuthenticated, async (req: any, res) => {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.length < 3) {
        return res.status(400).json({ message: "Search term must be at least 3 characters" });
      }
      
      const results = await storage.searchFraud(searchTerm);
      res.json(results);
    } catch (error) {
      console.error("Error searching fraud list:", error);
      res.status(500).json({ message: "Failed to search fraud list" });
    }
  });

  app.get('/api/fraud', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const fraudList = await storage.getFraudList(limit);
      res.json(fraudList);
    } catch (error) {
      console.error("Error fetching fraud list:", error);
      res.status(500).json({ message: "Failed to fetch fraud list" });
    }
  });

  app.post('/api/fraud', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const fraudData = insertFraudSchema.parse({
        ...req.body,
        reportedBy: userId
      });
      
      const fraud = await storage.createFraudEntry(fraudData);
      res.status(201).json(fraud);
    } catch (error) {
      console.error("Error creating fraud entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid fraud data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fraud entry" });
    }
  });

  // Friends routes
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get('/api/friends/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.post('/api/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { addresseeId } = req.body;
      
      if (userId === addresseeId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }

      const friendshipData = insertFriendshipSchema.parse({
        requesterId: userId,
        addresseeId
      });
      
      const friendship = await storage.createFriendRequest(friendshipData);
      res.status(201).json(friendship);
    } catch (error) {
      console.error("Error creating friend request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid friend request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create friend request" });
    }
  });

  app.patch('/api/friends/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friendshipId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify this is the addressee
      const requests = await storage.getFriendRequests(userId);
      const request = requests.find(r => r.id === friendshipId);
      
      if (!request) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      const friendship = await storage.updateFriendshipStatus(friendshipId, status);
      res.json(friendship);
    } catch (error) {
      console.error("Error updating friend request:", error);
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationRead(notificationId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin loan management routes
  app.get('/api/admin/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "ต้องเป็นแอดมินเท่านั้น" });
      }

      const { limit = 50, offset = 0 } = req.query;
      const loans = await storage.getAllLoans(parseInt(limit as string), parseInt(offset as string));
      res.json(loans);
    } catch (error) {
      console.error("Error fetching admin loans:", error);
      res.status(500).json({ message: "ไม่สามารถดึงข้อมูลคำขอกู้ได้" });
    }
  });

  app.post('/api/admin/loans/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "ต้องเป็นแอดมินเท่านั้น" });
      }

      const loanId = parseInt(req.params.id);
      const { notes } = req.body;

      const loan = await storage.approveLoan(loanId, userId, notes);
      res.json(loan);
    } catch (error) {
      console.error("Error approving loan:", error);
      res.status(400).json({ message: error.message || "ไม่สามารถอนุมัติคำขอกู้ได้" });
    }
  });

  app.post('/api/admin/loans/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "ต้องเป็นแอดมินเท่านั้น" });
      }

      const loanId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "กรุณาระบุเหตุผลการปฏิเสธ" });
      }

      const loan = await storage.rejectLoan(loanId, userId, reason);
      res.json(loan);
    } catch (error) {
      console.error("Error rejecting loan:", error);
      res.status(400).json({ message: error.message || "ไม่สามารถปฏิเสธคำขอกู้ได้" });
    }
  });

  // Admin system settings routes
  app.get('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "ต้องเป็นแอดมินเท่านั้น" });
      }

      // ดึงการตั้งค่าทั้งหมด (ในระบบจริงจะมีฟังก์ชันเฉพาะ)
      const settings = []; // จะขยายต่อไป
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "ไม่สามารถดึงการตั้งค่าได้" });
    }
  });

  app.put('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "ต้องเป็นแอดมินเท่านั้น" });
      }

      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
      }

      await storage.setSystemSetting(key, value);
      res.json({ message: "บันทึกการตั้งค่าสำเร็จ" });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "ไม่สามารถบันทึกการตั้งค่าได้" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await storage.getAllUsers(limit, offset);
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:id/xp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      const { xpChange } = req.body;
      
      if (typeof xpChange !== 'number') {
        return res.status(400).json({ message: "XP change must be a number" });
      }

      const updatedUser = await storage.updateUserXP(targetUserId, xpChange);
      
      // Notify user
      notifyUser(targetUserId, {
        type: 'admin_xp_change',
        title: 'XP Updated by Admin',
        message: `Your XP was ${xpChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(xpChange)} by an administrator`,
        xpChange
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user XP:", error);
      res.status(500).json({ message: "Failed to update user XP" });
    }
  });

  app.patch('/api/admin/users/:id/ban', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const targetUserId = req.params.id;
      const { banned } = req.body;
      
      const updatedUser = await storage.banUser(targetUserId, banned);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  app.get('/api/admin/settings/:key', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key } = req.params;
      const value = await storage.getSystemSetting(key);
      
      res.json({ key, value });
    } catch (error) {
      console.error("Error fetching system setting:", error);
      res.status(500).json({ message: "Failed to fetch system setting" });
    }
  });

  app.post('/api/admin/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { key, value } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }

      await storage.setSystemSetting(key, value);
      res.json({ message: "Setting updated successfully" });
    } catch (error) {
      console.error("Error updating system setting:", error);
      res.status(500).json({ message: "Failed to update system setting" });
    }
  });

  // Chat routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rooms = await storage.getChatRooms(userId);
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.get('/api/chat/messages/:roomId', isAuthenticated, async (req: any, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const messages = await storage.getChatMessages(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { roomId, content } = req.body;
      
      const message = await storage.sendMessage({
        roomId,
        userId,
        content
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Shop routes
  app.get('/api/shop/items', isAuthenticated, async (req: any, res) => {
    try {
      const category = req.query.category as string;
      const items = await storage.getShopItems(category);
      res.json(items);
    } catch (error) {
      console.error("Error fetching shop items:", error);
      res.status(500).json({ message: "Failed to fetch shop items" });
    }
  });

  app.get('/api/user/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  app.post('/api/shop/purchase', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId } = req.body;
      
      const purchasedItem = await storage.purchaseItem(userId, itemId);
      const item = await storage.getShopItems();
      const itemDetails = item.find(i => i.id === itemId);
      
      res.json({ 
        ...purchasedItem, 
        item: itemDetails 
      });
    } catch (error: any) {
      console.error("Error purchasing item:", error);
      res.status(400).json({ message: error.message || "Failed to purchase item" });
    }
  });

  app.post('/api/user/items/equip', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemId } = req.body;
      
      const equippedItem = await storage.equipItem(userId, itemId);
      const item = await storage.getShopItems();
      const itemDetails = item.find(i => i.id === itemId);
      
      res.json({ 
        ...equippedItem, 
        item: itemDetails 
      });
    } catch (error: any) {
      console.error("Error equipping item:", error);
      res.status(400).json({ message: error.message || "Failed to equip item" });
    }
  });



  return httpServer;
}
