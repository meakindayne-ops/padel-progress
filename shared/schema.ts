import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

import { users } from "./models/auth";

// Extended user profile/settings
export const user_profiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("player"), // player, coach, admin
  name: text("name").notNull(),
  level: doublePrecision("level"),
  handedness: text("handedness"),
  side: text("side"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  target: text("target").notNull(),
  done: boolean("done").default(false),
});

export const shots = pgTable("shots", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  key: text("key").notNull(), // forehand, backhand...
  label: text("label").notNull(),
  level: integer("level").notNull(),
  trend: text("trend").notNull(), // up, down, flat
});

export const shot_history = pgTable("shot_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  levels: jsonb("levels").notNull(), // { forehand: 4, ... }
});

export const sessions = pgTable("sessions_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  type: text("type").notNull(),
  focus: text("focus"),
  rating: integer("rating"),
  minutes: integer("minutes"),
});

export const nutrition_logs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  mealType: text("meal_type").notNull(),
  date: timestamp("date").defaultNow(),
});

export const nutrition_goals = pgTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  coachSuggestions: text("coach_suggestions"),
});

export const wellbeing = pgTable("wellbeing", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  sleep: integer("sleep"),
  stress: integer("stress"),
  energy: integer("energy"),
  soreness: integer("soreness"),
  notes: text("notes"),
});

export const strength_plans = pgTable("strength_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  day: text("day").notNull(),
  title: text("title").notNull(),
  items: jsonb("items").notNull(), // string[]
  notes: text("notes"),
});

export const coach_players = pgTable("coach_players", {
  id: serial("id").primaryKey(),
  coachUserId: varchar("coach_user_id").notNull().references(() => users.id),
  playerUserId: varchar("player_user_id").notNull().references(() => users.id),
});

export const coach_feedback = pgTable("coach_feedback", {
  id: serial("id").primaryKey(),
  coachUserId: varchar("coach_user_id").notNull().references(() => users.id),
  playerUserId: varchar("player_user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tactics = pgTable("tactics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  duration: text("duration").notNull(),
  category: text("category").notNull(),
  url: text("url"),
});

import { varchar } from "drizzle-orm/pg-core";

// Schemas
export const insertUserProfileSchema = createInsertSchema(user_profiles).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true });
export const insertShotSchema = createInsertSchema(shots).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertNutritionLogSchema = createInsertSchema(nutrition_logs).omit({ id: true });
export const insertNutritionGoalSchema = createInsertSchema(nutrition_goals).omit({ id: true });
export const insertWellbeingSchema = createInsertSchema(wellbeing).omit({ id: true });
export const insertStrengthPlanSchema = createInsertSchema(strength_plans).omit({ id: true });
export const insertCoachPlayerSchema = createInsertSchema(coach_players).omit({ id: true });
export const insertCoachFeedbackSchema = createInsertSchema(coach_feedback).omit({ id: true, createdAt: true });
export const insertTacticSchema = createInsertSchema(tactics).omit({ id: true });
export const insertVideoSchema = createInsertSchema(videos).omit({ id: true });

export type UserProfile = typeof user_profiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Shot = typeof shots.$inferSelect;
export type InsertShot = z.infer<typeof insertShotSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type NutritionLog = typeof nutrition_logs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;
export type NutritionGoal = typeof nutrition_goals.$inferSelect;
export type InsertNutritionGoal = z.infer<typeof insertNutritionGoalSchema>;
export type Wellbeing = typeof wellbeing.$inferSelect;
export type InsertWellbeing = z.infer<typeof insertWellbeingSchema>;
export type StrengthPlan = typeof strength_plans.$inferSelect;
export type InsertStrengthPlan = z.infer<typeof insertStrengthPlanSchema>;
export type CoachPlayer = typeof coach_players.$inferSelect;
export type InsertCoachPlayer = z.infer<typeof insertCoachPlayerSchema>;
export type CoachFeedback = typeof coach_feedback.$inferSelect;
export type InsertCoachFeedback = z.infer<typeof insertCoachFeedbackSchema>;
export type Tactic = typeof tactics.$inferSelect;
export type InsertTactic = z.infer<typeof insertTacticSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
