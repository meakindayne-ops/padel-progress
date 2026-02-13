import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { insertStrengthPlanSchema, insertTacticSchema, insertVideoSchema, insertCoachFeedbackSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth & Integrations
  await setupAuth(app);
  registerAuthRoutes(app);

  // === API ROUTES ===

  // Profiles
  app.get(api.profiles.me.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    let profile = await storage.getUserProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const pendingRole = req.cookies?.pendingRole;
    if (pendingRole && (pendingRole === "player" || pendingRole === "coach") && pendingRole !== profile.role) {
      profile = await storage.upsertUserProfile({ name: profile.name, role: pendingRole, userId });
      res.clearCookie("pendingRole");
    }

    res.json(profile);
  });

  app.post(api.profiles.upsert.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.profiles.upsert.input.parse(req.body);
    const profile = await storage.upsertUserProfile({ ...input, userId });
    res.json(profile);
  });

  // Goals
  app.get(api.goals.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.post(api.goals.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.goals.create.input.parse(req.body);
    const goal = await storage.createGoal({ ...input, userId });
    res.status(201).json(goal);
  });

  app.patch(api.goals.toggle.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const id = parseInt(req.params.id);
    const goal = await storage.toggleGoal(id, userId);
    if (!goal) return res.sendStatus(404);
    res.json(goal);
  });

  // Shots
  app.get(api.shots.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const shots = await storage.getShots(userId);
    res.json(shots);
  });

  app.post(api.shots.upsert.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.shots.upsert.input.parse(req.body);
    const shot = await storage.upsertShot({ ...input, userId });
    res.json(shot);
  });

  // Sessions
  app.get(api.sessions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const sessions = await storage.getSessions(userId);
    res.json(sessions);
  });

  app.post(api.sessions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.sessions.create.input.parse(req.body);
    const session = await storage.createSession({ ...input, userId });
    res.status(201).json(session);
  });

  // Nutrition
  app.get(api.nutrition.logs.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const logs = await storage.getNutritionLogs(userId);
    res.json(logs);
  });

  app.post(api.nutrition.createLog.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.nutrition.createLog.input.parse(req.body);
    const log = await storage.createNutritionLog({ ...input, userId });
    res.status(201).json(log);
  });

  app.get(api.nutrition.goal.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const goal = await storage.getNutritionGoal(userId);
    if (!goal) return res.status(404).json({ message: "No goal set" });
    res.json(goal);
  });

  app.post(api.nutrition.upsertGoal.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.nutrition.upsertGoal.input.parse(req.body);
    const goal = await storage.upsertNutritionGoal({ ...input, userId });
    res.json(goal);
  });

  // Wellbeing
  app.get(api.wellbeing.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const list = await storage.getWellbeing(userId);
    res.json(list);
  });

  app.post(api.wellbeing.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = api.wellbeing.create.input.parse(req.body);
    const entry = await storage.createWellbeing({ ...input, userId });
    res.status(201).json(entry);
  });

  // Strength Plans
  app.get(api.strength.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const plans = await storage.getStrengthPlansByUser(userId);
    res.json(plans);
  });

  app.post("/api/strength", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const input = insertStrengthPlanSchema.omit({ userId: true }).parse(req.body);
    const plan = await storage.createStrengthPlan({ ...input, userId });
    res.status(201).json(plan);
  });

  app.delete("/api/strength/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    await storage.deleteStrengthPlanByUser(parseInt(req.params.id), userId);
    res.sendStatus(204);
  });

  // Tactics
  app.get(api.tactics.list.path, async (req, res) => {
    const t = await storage.getTactics();
    res.json(t);
  });

  app.post("/api/tactics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = insertTacticSchema.parse(req.body);
    const tactic = await storage.createTactic(input);
    res.status(201).json(tactic);
  });

  app.delete("/api/tactics/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTactic(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Videos
  app.get(api.videos.list.path, async (req, res) => {
    const v = await storage.getVideos();
    res.json(v);
  });

  app.post("/api/videos", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = insertVideoSchema.parse(req.body);
    const video = await storage.createVideo(input);
    res.status(201).json(video);
  });

  app.delete("/api/videos/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteVideo(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Coach-Player Management
  app.get("/api/coach/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const players = await storage.getPlayersForCoach(userId);
    res.json(players);
  });

  app.post("/api/coach/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const { email } = req.body;
    if (!email || typeof email !== "string") return res.status(400).json({ message: "Player email is required" });
    const playerUser = await storage.findUserByEmail(email);
    if (!playerUser) return res.status(404).json({ message: "No user found with that email" });
    if (playerUser.id === userId) return res.status(400).json({ message: "You cannot add yourself as a player" });
    const link = await storage.linkPlayerToCoach(userId, playerUser.id);
    res.status(201).json(link);
  });

  app.delete("/api/coach/players/:playerUserId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    await storage.unlinkPlayerFromCoach(userId, req.params.playerUserId);
    res.sendStatus(204);
  });

  app.get("/api/coach/players/:playerUserId/shots", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerShots = await storage.getShots(req.params.playerUserId);
    res.json(playerShots);
  });

  app.get("/api/coach/players/:playerUserId/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerSessions = await storage.getSessions(req.params.playerUserId);
    res.json(playerSessions);
  });

  app.get("/api/coach/players/:playerUserId/wellbeing", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerWellbeing = await storage.getWellbeing(req.params.playerUserId);
    res.json(playerWellbeing);
  });

  app.get("/api/coach/players/:playerUserId/nutrition", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerNutrition = await storage.getNutritionLogs(req.params.playerUserId);
    res.json(playerNutrition);
  });

  app.get("/api/coach/players/:playerUserId/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerGoals = await storage.getGoals(req.params.playerUserId);
    res.json(playerGoals);
  });

  app.get("/api/coach/players/:playerUserId/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const playerProfile = await storage.getUserProfile(req.params.playerUserId);
    if (!playerProfile) return res.status(404).json({ message: "Player profile not found" });
    res.json(playerProfile);
  });

  app.get("/api/coach/players/:playerUserId/strength", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const plans = await storage.getStrengthPlansByUser(req.params.playerUserId);
    res.json(plans);
  });

  app.get("/api/coach/players/:playerUserId/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const feedback = await storage.getFeedbackForPlayer(req.params.playerUserId);
    res.json(feedback);
  });

  app.post("/api/coach/players/:playerUserId/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    const input = insertCoachFeedbackSchema.omit({ coachUserId: true, playerUserId: true }).parse(req.body);
    const feedback = await storage.createFeedback({
      ...input,
      coachUserId: userId,
      playerUserId: req.params.playerUserId,
    });
    res.status(201).json(feedback);
  });

  app.delete("/api/coach/feedback/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile || profile.role !== "coach") return res.status(403).json({ message: "Coach access required" });
    await storage.deleteFeedback(parseInt(req.params.id), userId);
    res.sendStatus(204);
  });

  // Player feedback (own feedback)
  app.get("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const feedback = await storage.getFeedbackForPlayer(userId);
    res.json(feedback);
  });

  // Seed Data
  await storage.seedStaticData();

  return httpServer;
}
