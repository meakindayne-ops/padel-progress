import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, Activity, BarChart2, Heart, Apple, Target, Dumbbell, BookOpen, MessageSquarePlus, Trash2, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Shot, Goal, Wellbeing as WellbeingType, StrengthPlan, Tactic } from "@shared/schema";

function usePlayerData(playerUserId: string) {
  const profile = useQuery({
    queryKey: ["/api/coach/players", playerUserId, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/profile`);
      if (!res.ok) return null;
      return res.json();
    },
  });
  const shots = useQuery<Shot[]>({
    queryKey: ["/api/coach/players", playerUserId, "shots"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/shots`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const sessions = useQuery({
    queryKey: ["/api/coach/players", playerUserId, "sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/sessions`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const wellbeing = useQuery<WellbeingType[]>({
    queryKey: ["/api/coach/players", playerUserId, "wellbeing"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/wellbeing`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const goals = useQuery<Goal[]>({
    queryKey: ["/api/coach/players", playerUserId, "goals"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/goals`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const nutrition = useQuery({
    queryKey: ["/api/coach/players", playerUserId, "nutrition"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/nutrition`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const strength = useQuery<StrengthPlan[]>({
    queryKey: ["/api/coach/players", playerUserId, "strength"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/strength`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const feedback = useQuery({
    queryKey: ["/api/coach/players", playerUserId, "feedback"],
    queryFn: async () => {
      const res = await fetch(`/api/coach/players/${playerUserId}/feedback`);
      if (!res.ok) return [];
      return res.json();
    },
  });
  const tactics = useQuery<Tactic[]>({
    queryKey: ["/api/tactics"],
  });

  return { profile, shots, sessions, wellbeing, goals, nutrition, strength, feedback, tactics };
}

const FEEDBACK_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "technique", label: "Technique" },
  { value: "fitness", label: "Fitness" },
  { value: "nutrition", label: "Nutrition" },
  { value: "mental", label: "Mental Game" },
  { value: "tactics", label: "Tactics" },
];

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { profile, shots, sessions, wellbeing, goals, nutrition, strength, feedback, tactics } = usePlayerData(params.id || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const addFeedback = useMutation({
    mutationFn: async (data: { category: string; message: string }) => {
      const res = await apiRequest("POST", `/api/coach/players/${params.id}/feedback`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/players", params.id, "feedback"] });
      setFeedbackMessage("");
      setFeedbackCategory("general");
      toast({ title: "Feedback sent" });
    },
    onError: () => {
      toast({ title: "Failed to send feedback", variant: "destructive" });
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/coach/feedback/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/players", params.id, "feedback"] });
    },
  });

  const isLoading = profile.isLoading;

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      </LayoutShell>
    );
  }

  const playerName = profile.data?.name || "Player";

  return (
    <LayoutShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/players")}
            className="text-slate-400"
            data-testid="button-back-to-players"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-white" data-testid="text-player-name">
              {playerName}
            </h1>
            <p className="text-slate-400 text-sm">
              Level: {profile.data?.level?.toFixed(1) || "Not set"} | {profile.data?.handedness || "N/A"} | {profile.data?.side || "N/A"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" data-testid="tabs-player-detail">
          <TabsList className="bg-slate-900 border border-slate-800 flex-wrap gap-1">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="shots" data-testid="tab-shots">Shots</TabsTrigger>
            <TabsTrigger value="sessions" data-testid="tab-sessions">Sessions</TabsTrigger>
            <TabsTrigger value="snc" data-testid="tab-snc">SNC</TabsTrigger>
            <TabsTrigger value="nutrition" data-testid="tab-nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="wellbeing" data-testid="tab-wellbeing">Wellbeing</TabsTrigger>
            <TabsTrigger value="tactics" data-testid="tab-tactics">Tactics</TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="size-4 text-blue-400" />
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Shots Tracked</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{shots.data?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart2 className="size-4 text-emerald-400" />
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sessions</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{sessions.data?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="size-4 text-rose-400" />
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Wellbeing Logs</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{wellbeing.data?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="size-4 text-amber-400" />
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Goals</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {goals.data?.filter((g: Goal) => g.done).length || 0}/{goals.data?.length || 0} done
                  </p>
                </CardContent>
              </Card>
            </div>

            {goals.data && goals.data.length > 0 && (
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-lg text-white">Active Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goals.data.map((goal: Goal) => (
                    <div key={goal.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                      <div>
                        <p className={`font-medium ${goal.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {goal.title}
                        </p>
                        <p className="text-xs text-slate-500">Target: {goal.target}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-mono ${goal.done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                        {goal.done ? "DONE" : "IN PROGRESS"}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shots" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white">Shot Levels</CardTitle>
              </CardHeader>
              <CardContent>
                {shots.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No shots tracked yet.</p>
                ) : (
                  <div className="space-y-3">
                    {shots.data?.map((shot: Shot) => (
                      <div key={shot.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div>
                          <p className="font-medium text-slate-200">{shot.label}</p>
                          <p className="text-xs text-slate-500 capitalize">{shot.key}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs ${shot.trend === "up" ? "text-emerald-400" : shot.trend === "down" ? "text-rose-400" : "text-slate-400"}`}>
                            {shot.trend === "up" ? "Improving" : shot.trend === "down" ? "Declining" : "Stable"}
                          </span>
                          <span className="text-lg font-bold text-white">{shot.level}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white">Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No sessions logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.data?.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div>
                          <p className="font-medium text-slate-200 capitalize">{session.type}</p>
                          <p className="text-xs text-slate-500">{session.focus || "No focus set"} | {session.minutes ? `${session.minutes} min` : "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{session.rating || "-"}/10</p>
                          <p className="text-xs text-slate-500">{session.date ? new Date(session.date).toLocaleDateString() : ""}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snc" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Dumbbell className="size-5 text-indigo-400" />
                  Strength & Conditioning Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strength.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No strength plans created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {strength.data?.map((plan: StrengthPlan) => (
                      <div key={plan.id} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-medium text-slate-200">{plan.title}</p>
                          <span className="text-xs px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 font-medium">{plan.day}</span>
                        </div>
                        {Array.isArray(plan.items) && (
                          <ul className="space-y-1 mt-2">
                            {(plan.items as string[]).map((item, i) => (
                              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">-</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {plan.notes && <p className="text-xs text-slate-500 mt-2 italic">{plan.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Apple className="size-5 text-emerald-400" />
                  Nutrition Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nutrition.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No nutrition data logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {nutrition.data?.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div>
                          <p className="font-medium text-slate-200">{log.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{log.mealType} | {log.date ? new Date(log.date).toLocaleDateString() : ""}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400 space-y-0.5">
                          <p>{log.calories} kcal</p>
                          <p>P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellbeing" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Heart className="size-5 text-rose-400" />
                  Wellbeing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {wellbeing.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No wellbeing data logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {wellbeing.data?.map((entry: WellbeingType) => (
                      <div key={entry.id} className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-500">{entry.date ? new Date(entry.date).toLocaleDateString() : ""}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Sleep</p>
                            <p className="text-sm font-bold text-white">{entry.sleep || "-"}/10</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Energy</p>
                            <p className="text-sm font-bold text-white">{entry.energy || "-"}/10</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Stress</p>
                            <p className="text-sm font-bold text-white">{entry.stress || "-"}/10</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Soreness</p>
                            <p className="text-sm font-bold text-white">{entry.soreness || "-"}/10</p>
                          </div>
                        </div>
                        {entry.notes && <p className="text-xs text-slate-400 mt-2">{entry.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tactics" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BookOpen className="size-5 text-amber-400" />
                  Tactical Playbook
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tactics.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No tactics available.</p>
                ) : (
                  <div className="space-y-3">
                    {tactics.data?.map((tactic: Tactic) => (
                      <div key={tactic.id} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <p className="font-medium text-slate-200">{tactic.title}</p>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            tactic.difficulty === "Advanced" ? "bg-rose-500/20 text-rose-400" :
                            tactic.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-400" :
                            "bg-emerald-500/20 text-emerald-400"
                          }`}>{tactic.difficulty}</span>
                        </div>
                        <p className="text-sm text-slate-400">{tactic.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MessageSquarePlus className="size-5 text-blue-400" />
                  Send Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Category</label>
                    <Select value={feedbackCategory} onValueChange={setFeedbackCategory}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-feedback-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FEEDBACK_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-300">Message</label>
                    <Textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Write your feedback for this player..."
                      className="bg-slate-800 border-slate-700 text-white min-h-[100px] resize-none"
                      data-testid="input-feedback-message"
                    />
                  </div>
                  <Button
                    onClick={() => addFeedback.mutate({ category: feedbackCategory, message: feedbackMessage })}
                    disabled={addFeedback.isPending || !feedbackMessage.trim()}
                    className="bg-blue-600"
                    data-testid="button-send-feedback"
                  >
                    {addFeedback.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Send className="size-4 mr-2" />}
                    Send Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-lg text-white">Previous Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.data?.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">No feedback sent yet. Write your first note above.</p>
                ) : (
                  <div className="space-y-3">
                    {feedback.data?.map((fb: any) => (
                      <div key={fb.id} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${
                              fb.category === "technique" ? "bg-blue-500/20 text-blue-400" :
                              fb.category === "fitness" ? "bg-emerald-500/20 text-emerald-400" :
                              fb.category === "nutrition" ? "bg-amber-500/20 text-amber-400" :
                              fb.category === "mental" ? "bg-purple-500/20 text-purple-400" :
                              fb.category === "tactics" ? "bg-rose-500/20 text-rose-400" :
                              "bg-slate-700 text-slate-300"
                            }`}>{fb.category}</span>
                            <span className="text-xs text-slate-500">
                              {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-500 hover:text-rose-400"
                            onClick={() => deleteFeedback.mutate(fb.id)}
                            data-testid={`button-delete-feedback-${fb.id}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{fb.message}</p>
                        <p className="text-xs text-slate-600 mt-2">By {fb.coachName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}
