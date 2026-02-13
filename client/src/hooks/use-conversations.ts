import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export function useConversations() {
  return useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json() as Promise<Conversation[]>;
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: ["/api/conversations", id],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json() as Promise<Conversation>;
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json() as Promise<Conversation>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/conversations"] }),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/conversations"] }),
  });
}
