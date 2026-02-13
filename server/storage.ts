import { db } from "./db";
import { 
  user_profiles, goals, shots, sessions, nutrition_logs, nutrition_goals, wellbeing,
  strength_plans, tactics, videos, coach_players, coach_feedback,
  type InsertUserProfile, type InsertGoal, type InsertShot, type InsertSession,
  type InsertNutritionLog, type InsertNutritionGoal, type InsertWellbeing,
  type InsertStrengthPlan, type InsertTactic, type InsertVideo, type InsertCoachFeedback
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Profiles
  getUserProfile(userId: string): Promise<typeof user_profiles.$inferSelect | undefined>;
  upsertUserProfile(profile: InsertUserProfile & { userId: string }): Promise<typeof user_profiles.$inferSelect>;

  // Goals
  getGoals(userId: string): Promise<typeof goals.$inferSelect[]>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<typeof goals.$inferSelect>;
  toggleGoal(id: number, userId: string): Promise<typeof goals.$inferSelect | undefined>;

  // Shots
  getShots(userId: string): Promise<typeof shots.$inferSelect[]>;
  upsertShot(shot: InsertShot & { userId: string }): Promise<typeof shots.$inferSelect>;

  // Sessions
  getSessions(userId: string): Promise<typeof sessions.$inferSelect[]>;
  createSession(session: InsertSession & { userId: string }): Promise<typeof sessions.$inferSelect>;

  // Nutrition
  getNutritionLogs(userId: string): Promise<typeof nutrition_logs.$inferSelect[]>;
  createNutritionLog(log: InsertNutritionLog & { userId: string }): Promise<typeof nutrition_logs.$inferSelect>;
  getNutritionGoal(userId: string): Promise<typeof nutrition_goals.$inferSelect | undefined>;
  upsertNutritionGoal(goal: InsertNutritionGoal & { userId: string }): Promise<typeof nutrition_goals.$inferSelect>;

  // Wellbeing
  getWellbeing(userId: string): Promise<typeof wellbeing.$inferSelect[]>;
  createWellbeing(entry: InsertWellbeing & { userId: string }): Promise<typeof wellbeing.$inferSelect>;

  // Static/Shared
  getStrengthPlans(): Promise<typeof strength_plans.$inferSelect[]>;
  getStrengthPlansByUser(userId: string): Promise<typeof strength_plans.$inferSelect[]>;
  createStrengthPlan(plan: InsertStrengthPlan & { userId: string }): Promise<typeof strength_plans.$inferSelect>;
  deleteStrengthPlan(id: number): Promise<void>;
  deleteStrengthPlanByUser(id: number, userId: string): Promise<void>;
  getTactics(): Promise<typeof tactics.$inferSelect[]>;
  createTactic(tactic: InsertTactic): Promise<typeof tactics.$inferSelect>;
  deleteTactic(id: number): Promise<void>;
  getVideos(): Promise<typeof videos.$inferSelect[]>;
  createVideo(video: InsertVideo): Promise<typeof videos.$inferSelect>;
  deleteVideo(id: number): Promise<void>;
  
  // Coach-Player relationships
  getPlayersForCoach(coachUserId: string): Promise<{ playerUserId: string; firstName: string | null; lastName: string | null; email: string | null; profileImageUrl: string | null; role: string | null; level: number | null }[]>;
  linkPlayerToCoach(coachUserId: string, playerUserId: string): Promise<typeof coach_players.$inferSelect>;
  unlinkPlayerFromCoach(coachUserId: string, playerUserId: string): Promise<void>;
  findUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined>;
  getAllProfiles(): Promise<typeof user_profiles.$inferSelect[]>;

  // Coach Feedback
  getFeedbackForPlayer(playerUserId: string): Promise<(typeof coach_feedback.$inferSelect & { coachName?: string })[]>;
  createFeedback(feedback: InsertCoachFeedback): Promise<typeof coach_feedback.$inferSelect>;
  deleteFeedback(id: number, coachUserId: string): Promise<void>;

  // Strength plans for a specific player (coach viewing)
  getStrengthPlansByUser(userId: string): Promise<typeof strength_plans.$inferSelect[]>;

  // Seed helpers
  seedStaticData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string) {
    const [profile] = await db.select().from(user_profiles).where(eq(user_profiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile & { userId: string }) {
    const [existing] = await db.select().from(user_profiles).where(eq(user_profiles.userId, profile.userId));
    if (existing) {
      const [updated] = await db.update(user_profiles).set(profile).where(eq(user_profiles.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(user_profiles).values(profile).returning();
    return created;
  }

  async getGoals(userId: string) {
    return db.select().from(goals).where(eq(goals.userId, userId));
  }

  async createGoal(goal: InsertGoal & { userId: string }) {
    const [created] = await db.insert(goals).values(goal).returning();
    return created;
  }

  async toggleGoal(id: number, userId: string) {
    const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
    if (!goal) return undefined;
    const [updated] = await db.update(goals).set({ done: !goal.done }).where(eq(goals.id, id)).returning();
    return updated;
  }

  async getShots(userId: string) {
    return db.select().from(shots).where(eq(shots.userId, userId));
  }

  async upsertShot(shot: InsertShot & { userId: string }) {
    // Check if shot with key exists for user
    const [existing] = await db.select().from(shots).where(and(eq(shots.userId, shot.userId), eq(shots.key, shot.key)));
    if (existing) {
      const [updated] = await db.update(shots).set(shot).where(eq(shots.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(shots).values(shot).returning();
    return created;
  }

  async getSessions(userId: string) {
    return db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async createSession(session: InsertSession & { userId: string }) {
    const [created] = await db.insert(sessions).values(session).returning();
    return created;
  }

  async getNutritionLogs(userId: string) {
    return db.select().from(nutrition_logs).where(eq(nutrition_logs.userId, userId));
  }

  async createNutritionLog(log: InsertNutritionLog & { userId: string }) {
    const [created] = await db.insert(nutrition_logs).values(log).returning();
    return created;
  }

  async getNutritionGoal(userId: string) {
    const [goal] = await db.select().from(nutrition_goals).where(eq(nutrition_goals.userId, userId));
    return goal;
  }

  async upsertNutritionGoal(goal: InsertNutritionGoal & { userId: string }) {
    const [existing] = await db.select().from(nutrition_goals).where(eq(nutrition_goals.userId, goal.userId));
    if (existing) {
      const [updated] = await db.update(nutrition_goals).set(goal).where(eq(nutrition_goals.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(nutrition_goals).values(goal).returning();
    return created;
  }

  async getWellbeing(userId: string) {
    return db.select().from(wellbeing).where(eq(wellbeing.userId, userId));
  }

  async createWellbeing(entry: InsertWellbeing & { userId: string }) {
    const [created] = await db.insert(wellbeing).values(entry).returning();
    return created;
  }

  async getStrengthPlans() {
    return db.select().from(strength_plans);
  }

  async getStrengthPlansByUser(userId: string) {
    return db.select().from(strength_plans).where(eq(strength_plans.userId, userId));
  }

  async createStrengthPlan(plan: InsertStrengthPlan & { userId: string }) {
    const [created] = await db.insert(strength_plans).values(plan).returning();
    return created;
  }

  async deleteStrengthPlan(id: number) {
    await db.delete(strength_plans).where(eq(strength_plans.id, id));
  }

  async deleteStrengthPlanByUser(id: number, userId: string) {
    await db.delete(strength_plans).where(and(eq(strength_plans.id, id), eq(strength_plans.userId, userId)));
  }

  async getTactics() {
    return db.select().from(tactics);
  }

  async createTactic(tactic: InsertTactic) {
    const [created] = await db.insert(tactics).values(tactic).returning();
    return created;
  }

  async deleteTactic(id: number) {
    await db.delete(tactics).where(eq(tactics.id, id));
  }

  async getVideos() {
    return db.select().from(videos);
  }

  async createVideo(video: InsertVideo) {
    const [created] = await db.insert(videos).values(video).returning();
    return created;
  }

  async deleteVideo(id: number) {
    await db.delete(videos).where(eq(videos.id, id));
  }

  async getPlayersForCoach(coachUserId: string) {
    const links = await db.select().from(coach_players).where(eq(coach_players.coachUserId, coachUserId));
    const results = [];
    for (const link of links) {
      const [user] = await db.select().from(users).where(eq(users.id, link.playerUserId));
      const [profile] = await db.select().from(user_profiles).where(eq(user_profiles.userId, link.playerUserId));
      if (user) {
        results.push({
          playerUserId: link.playerUserId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          role: profile?.role || "player",
          level: profile?.level || null,
        });
      }
    }
    return results;
  }

  async linkPlayerToCoach(coachUserId: string, playerUserId: string) {
    const [existing] = await db.select().from(coach_players).where(
      and(eq(coach_players.coachUserId, coachUserId), eq(coach_players.playerUserId, playerUserId))
    );
    if (existing) return existing;
    const [created] = await db.insert(coach_players).values({ coachUserId, playerUserId }).returning();
    return created;
  }

  async unlinkPlayerFromCoach(coachUserId: string, playerUserId: string) {
    await db.delete(coach_players).where(
      and(eq(coach_players.coachUserId, coachUserId), eq(coach_players.playerUserId, playerUserId))
    );
  }

  async findUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllProfiles() {
    return db.select().from(user_profiles);
  }

  async getFeedbackForPlayer(playerUserId: string) {
    const feedbackRows = await db.select().from(coach_feedback).where(eq(coach_feedback.playerUserId, playerUserId));
    const results = [];
    for (const fb of feedbackRows) {
      const [coachProfile] = await db.select().from(user_profiles).where(eq(user_profiles.userId, fb.coachUserId));
      results.push({ ...fb, coachName: coachProfile?.name || "Coach" });
    }
    results.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db2 - da;
    });
    return results;
  }

  async createFeedback(feedback: InsertCoachFeedback) {
    const [created] = await db.insert(coach_feedback).values(feedback).returning();
    return created;
  }

  async deleteFeedback(id: number, coachUserId: string) {
    await db.delete(coach_feedback).where(and(eq(coach_feedback.id, id), eq(coach_feedback.coachUserId, coachUserId)));
  }

  async seedStaticData() {
    // Seed Tactics
    const existingTactics = await this.getTactics();
    if (existingTactics.length === 0) {
      await db.insert(tactics).values([
        { title: "The Australian Formation", description: "Serving tactic.", difficulty: "Intermediate" },
        { title: "Net Blitz", description: "Aggressive net positioning.", difficulty: "Advanced" },
      ]);
    }

    // Seed Videos
    const existingVideos = await this.getVideos();
    if (existingVideos.length === 0) {
      await db.insert(videos).values([
        { title: "Bandeja Masterclass", duration: "12:45", category: "Technique", url: "https://example.com/v1" },
        { title: "The Split Step Secret", duration: "05:20", category: "Footwork", url: "https://example.com/v2" },
      ]);
    }
  }
}

export const storage = new DatabaseStorage();
