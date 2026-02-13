import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { 
  InsertGoal, InsertShot, InsertSession, InsertNutritionLog, 
  InsertNutritionGoal, InsertWellbeing
} from "@shared/schema";
import { z } from "zod";

// --- Profiles ---
export function useProfile() {
  return useQuery({
    queryKey: [api.profiles.me.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.me.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.profiles.upsert.input>) => {
      const res = await fetch(api.profiles.upsert.path, {
        method: api.profiles.upsert.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.upsert.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

// --- Goals ---
export function useGoals() {
  return useQuery({
    queryKey: [api.goals.list.path],
    queryFn: async () => {
      const res = await fetch(api.goals.list.path);
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertGoal) => {
      const res = await fetch(api.goals.create.path, {
        method: api.goals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return api.goals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.goals.list.path] }),
  });
}

export function useToggleGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.goals.toggle.path, { id });
      const res = await fetch(url, { method: api.goals.toggle.method });
      if (!res.ok) throw new Error("Failed to toggle goal");
      return api.goals.toggle.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.goals.list.path] }),
  });
}

// --- Shots ---
export function useShots() {
  return useQuery({
    queryKey: [api.shots.list.path],
    queryFn: async () => {
      const res = await fetch(api.shots.list.path);
      if (!res.ok) throw new Error("Failed to fetch shots");
      return api.shots.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpsertShot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertShot) => {
      const res = await fetch(api.shots.upsert.path, {
        method: api.shots.upsert.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to upsert shot");
      return api.shots.upsert.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.shots.list.path] }),
  });
}

// --- Sessions ---
export function useSessions() {
  return useQuery({
    queryKey: [api.sessions.list.path],
    queryFn: async () => {
      const res = await fetch(api.sessions.list.path);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return api.sessions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSession) => {
      const res = await fetch(api.sessions.create.path, {
        method: api.sessions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create session");
      return api.sessions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sessions.list.path] }),
  });
}

// --- Nutrition ---
export function useNutritionLogs() {
  return useQuery({
    queryKey: [api.nutrition.logs.path],
    queryFn: async () => {
      const res = await fetch(api.nutrition.logs.path);
      if (!res.ok) throw new Error("Failed to fetch nutrition logs");
      return api.nutrition.logs.responses[200].parse(await res.json());
    },
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertNutritionLog) => {
      const res = await fetch(api.nutrition.createLog.path, {
        method: api.nutrition.createLog.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create nutrition log");
      return api.nutrition.createLog.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.nutrition.logs.path] }),
  });
}

export function useNutritionGoal() {
  return useQuery({
    queryKey: [api.nutrition.goal.path],
    queryFn: async () => {
      const res = await fetch(api.nutrition.goal.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch nutrition goal");
      return api.nutrition.goal.responses[200].parse(await res.json());
    },
  });
}

export function useUpsertNutritionGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertNutritionGoal) => {
      const res = await fetch(api.nutrition.upsertGoal.path, {
        method: api.nutrition.upsertGoal.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to upsert nutrition goal");
      return api.nutrition.upsertGoal.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.nutrition.goal.path] }),
  });
}

// --- Wellbeing ---
export function useWellbeing() {
  return useQuery({
    queryKey: [api.wellbeing.list.path],
    queryFn: async () => {
      const res = await fetch(api.wellbeing.list.path);
      if (!res.ok) throw new Error("Failed to fetch wellbeing");
      return api.wellbeing.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWellbeing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWellbeing) => {
      const res = await fetch(api.wellbeing.create.path, {
        method: api.wellbeing.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create wellbeing entry");
      return api.wellbeing.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.wellbeing.list.path] }),
  });
}

// --- Static Content (Videos, Plans, Tactics) ---
export function useVideos() {
  return useQuery({
    queryKey: [api.videos.list.path],
    queryFn: async () => {
      const res = await fetch(api.videos.list.path);
      if (!res.ok) throw new Error("Failed to fetch videos");
      return api.videos.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; duration: string; category: string; url?: string }) => {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create video");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.videos.list.path] }),
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.videos.list.path] }),
  });
}

export function useStrengthPlans() {
  return useQuery({
    queryKey: [api.strength.list.path],
    queryFn: async () => {
      const res = await fetch(api.strength.list.path);
      if (!res.ok) throw new Error("Failed to fetch strength plans");
      return api.strength.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateStrengthPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { day: string; title: string; items: string[]; notes?: string }) => {
      const res = await fetch("/api/strength", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create strength plan");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.strength.list.path] }),
  });
}

export function useDeleteStrengthPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/strength/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete plan");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.strength.list.path] }),
  });
}

export function useTactics() {
  return useQuery({
    queryKey: [api.tactics.list.path],
    queryFn: async () => {
      const res = await fetch(api.tactics.list.path);
      if (!res.ok) throw new Error("Failed to fetch tactics");
      return api.tactics.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTactic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; difficulty: string }) => {
      const res = await fetch("/api/tactics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create tactic");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tactics.list.path] }),
  });
}

export function useDeleteTactic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/tactics/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tactic");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tactics.list.path] }),
  });
}
