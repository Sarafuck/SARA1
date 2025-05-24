import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserWithStats(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Posts routes
  app.get('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, imageUrl } = req.body;
      
      const post = await storage.createPost({
        userId,
        content,
        imageUrl: imageUrl || null
      });
      
      // Add XP for posting
      await storage.updateUserXP(userId, 10);
      
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
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

  // Loans routes
  app.post('/api/loans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, loanTermDays, loanPurpose } = req.body;
      
      // Calculate loan terms
      const terms = await storage.calculateLoanTerms(userId, amount, loanTermDays);
      
      const loan = await storage.createLoan({
        userId,
        amount: amount.toString(),
        interestRate: terms.interestRate.toString(),
        loanPurpose,
        loanTermDays,
        dueDate: new Date(Date.now() + loanTermDays * 24 * 60 * 60 * 1000)
      });
      
      res.json(loan);
    } catch (error) {
      console.error("Error creating loan:", error);
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

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

  // Create simple HTTP server
  const httpServer = createServer(app);
  return httpServer;
}