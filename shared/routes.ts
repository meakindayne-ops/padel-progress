import { z } from 'zod';
import { 
  insertUserProfileSchema, insertGoalSchema, insertShotSchema, insertSessionSchema,
  insertNutritionLogSchema, insertNutritionGoalSchema, insertWellbeingSchema,
  insertStrengthPlanSchema, insertTacticSchema, insertVideoSchema,
  user_profiles, goals, shots, sessions, nutrition_logs, nutrition_goals, wellbeing,
  strength_plans, tactics, videos
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    me: {
      method: 'GET' as const,
      path: '/api/profiles/me' as const,
      responses: {
        200: z.custom<typeof user_profiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/profiles' as const,
      input: insertUserProfileSchema.omit({ userId: true }),
      responses: {
        200: z.custom<typeof user_profiles.$inferSelect>(),
      },
    },
  },
  goals: {
    list: {
      method: 'GET' as const,
      path: '/api/goals' as const,
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals' as const,
      input: insertGoalSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/goals/:id/toggle' as const,
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
      },
    },
  },
  shots: {
    list: {
      method: 'GET' as const,
      path: '/api/shots' as const,
      responses: {
        200: z.array(z.custom<typeof shots.$inferSelect>()),
      },
    },
    upsert: {
      method: 'POST' as const,
      path: '/api/shots' as const,
      input: insertShotSchema.omit({ userId: true }),
      responses: {
        200: z.custom<typeof shots.$inferSelect>(),
      },
    },
  },
  sessions: {
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof sessions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sessions' as const,
      input: insertSessionSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof sessions.$inferSelect>(),
      },
    },
  },
  nutrition: {
    logs: {
      method: 'GET' as const,
      path: '/api/nutrition/logs' as const,
      responses: {
        200: z.array(z.custom<typeof nutrition_logs.$inferSelect>()),
      },
    },
    createLog: {
      method: 'POST' as const,
      path: '/api/nutrition/logs' as const,
      input: insertNutritionLogSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof nutrition_logs.$inferSelect>(),
      },
    },
    goal: {
      method: 'GET' as const,
      path: '/api/nutrition/goal' as const,
      responses: {
        200: z.custom<typeof nutrition_goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    upsertGoal: {
      method: 'POST' as const,
      path: '/api/nutrition/goal' as const,
      input: insertNutritionGoalSchema.omit({ userId: true }),
      responses: {
        200: z.custom<typeof nutrition_goals.$inferSelect>(),
      },
    },
  },
  wellbeing: {
    list: {
      method: 'GET' as const,
      path: '/api/wellbeing' as const,
      responses: {
        200: z.array(z.custom<typeof wellbeing.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/wellbeing' as const,
      input: insertWellbeingSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof wellbeing.$inferSelect>(),
      },
    },
  },
  strength: {
    list: {
      method: 'GET' as const,
      path: '/api/strength' as const,
      responses: {
        200: z.array(z.custom<typeof strength_plans.$inferSelect>()),
      },
    },
  },
  tactics: {
    list: {
      method: 'GET' as const,
      path: '/api/tactics' as const,
      responses: {
        200: z.array(z.custom<typeof tactics.$inferSelect>()),
      },
    },
  },
  videos: {
    list: {
      method: 'GET' as const,
      path: '/api/videos' as const,
      responses: {
        200: z.array(z.custom<typeof videos.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
