import { useAuth } from "@/hooks/use-auth";
import { useProfile, useGoals, useToggleGoal, useCreateGoal } from "@/hooks/use-padel-data";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle2, Circle, Trophy, Calendar, Zap, ArrowRight, Loader2, Target, Video, Apple, Dumbbell, ClipboardList, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: goals } = useGoals();
  const { mutate: toggleGoal } = useToggleGoal();
  const { mutate: createGoal, isPending: isCreatingGoal } = useCreateGoal();

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const handleCreateGoal = () => {
    createGoal({ title: newGoalTitle, target: newGoalTarget, done: false }, {
      onSuccess: () => {
        setGoalDialogOpen(false);
        setNewGoalTitle("");
        setNewGoalTarget("");
      }
    });
  };

  const nextSessionDate = new Date();
  nextSessionDate.setDate(nextSessionDate.getDate() + 1);
  nextSessionDate.setHours(18, 0, 0, 0);

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-welcome-heading">
              Welcome back, <span className="text-blue-400">{user?.firstName}</span>
            </h1>
            <p className="text-slate-400" data-testid="text-welcome-subtitle">Track your progress, get coach and self feedback, and take your padel game to the next level.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center gap-3">
               <div className="size-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                 <Zap className="size-5" />
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Streak</p>
                 <p className="text-lg font-bold text-white">12 Days</p>
               </div>
             </div>
             <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-3 flex items-center gap-3">
               <div className="size-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                 <Trophy className="size-5" />
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Level</p>
                 <p className="text-lg font-bold text-white">{profile?.level?.toFixed(1) || "N/A"}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals Column */}
          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium text-white">Active Goals</CardTitle>
              <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800 text-slate-300">
                    <Plus className="size-4 mr-1" /> Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Set New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Goal Title</label>
                      <Input 
                        placeholder="e.g. Master the Bandeja" 
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Target Metric</label>
                      <Input 
                        placeholder="e.g. 8/10 successful shots" 
                        value={newGoalTarget}
                        onChange={(e) => setNewGoalTarget(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateGoal} 
                      disabled={isCreatingGoal || !newGoalTitle}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreatingGoal ? <Loader2 className="size-4 animate-spin" /> : "Create Goal"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals?.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No active goals. Set one to get started!</div>
              ) : (
                goals?.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                      goal.done 
                        ? "bg-slate-800/20 border-slate-800/50 opacity-60" 
                        : "bg-slate-800/40 border-slate-700/50 hover:border-blue-500/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "size-6 rounded-full border flex items-center justify-center transition-colors",
                          goal.done 
                            ? "bg-green-500 border-green-500 text-black" 
                            : "border-slate-600 hover:border-blue-500 text-transparent"
                        )}
                      >
                        <CheckCircle2 className="size-4" />
                      </button>
                      <div>
                        <h4 className={cn("font-medium", goal.done ? "text-slate-400 line-through" : "text-slate-200")}>
                          {goal.title}
                        </h4>
                        <p className="text-xs text-slate-500">Target: {goal.target}</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400">
                      {goal.done ? "COMPLETED" : "IN PROGRESS"}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Right Column Stack */}
          <div className="space-y-6">
            {/* Next Session Card */}
            <Card className="border-slate-800 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[64px] rounded-full pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                  <Calendar className="size-5 text-indigo-400" />
                  Next Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-display font-bold text-white">Tomorrow</p>
                  <p className="text-indigo-300 font-medium">{format(nextSessionDate, "h:mm a")}</p>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Circle className="size-2 fill-emerald-500 text-emerald-500" />
                    Focus: Defensive Lobs
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Circle className="size-2 fill-amber-500 text-amber-500" />
                    Coach: Sarah M.
                  </div>
                </div>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md">
                  View Plan <ArrowRight className="size-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-white">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Sessions Completed</span>
                       <span className="text-white font-bold">3/4</span>
                    </div>
                    <Progress value={75} className="h-2 bg-slate-800" />
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2">
                       <span className="text-slate-400">Shot Accuracy</span>
                       <span className="text-white font-bold">68%</span>
                    </div>
                    <Progress value={68} className="h-2 bg-slate-800 [&>div]:bg-emerald-500" />
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What Padel Progress Offers */}
        <div>
          <h2 className="text-xl font-display font-semibold text-white mb-4" data-testid="text-features-heading">What Padel Progress Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Target, color: "text-blue-400 bg-blue-500/20", title: "Shot Tracking", desc: "Rate and monitor every shot in your game. Track your technique over time and identify areas to improve." },
              { icon: ClipboardList, color: "text-indigo-400 bg-indigo-500/20", title: "Coach & Self Feedback", desc: "Log feedback from your coach or your own observations after every session to guide your development." },
              { icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/20", title: "Progress Analytics", desc: "Visualise your improvement with charts and stats. See how your sessions, shots, and fitness evolve." },
              { icon: Video, color: "text-amber-400 bg-amber-500/20", title: "Video Library", desc: "Watch videos of the perfect model for every shot. Learn the right technique from expert demonstrations." },
              { icon: Apple, color: "text-rose-400 bg-rose-500/20", title: "Nutrition Support", desc: "Log meals, track macros, and set daily nutrition targets to fuel your performance on and off the court." },
              { icon: Dumbbell, color: "text-purple-400 bg-purple-500/20", title: "Strength & Conditioning", desc: "Follow structured workout plans designed to build the fitness and strength you need for padel." },
            ].map((feature) => (
              <Card key={feature.title} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className={`size-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-medium text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
