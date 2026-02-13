import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Target, TrendingUp, ClipboardList, BarChart3, Utensils, Activity } from "lucide-react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = (role: "player" | "coach") => {
    window.location.href = `/api/login?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
       <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
       <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

       <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
          <div className="max-w-4xl w-full space-y-10">
             <div className="text-center space-y-5">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="font-bold text-white text-2xl">P</span>
                  </div>
                  <span className="font-display font-bold text-3xl tracking-tight text-white">Padel Progress</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight" data-testid="text-login-heading">
                  Elevate your game with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">expert feedback</span> and tracking.
                </h1>

                <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto" data-testid="text-login-subtitle">
                  Whether you're a player tracking your own progress or a coach guiding your team, Padel Progress has you covered.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 p-6 shadow-2xl space-y-5" data-testid="card-player-login">
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-blue-500/15 flex items-center justify-center">
                        <User className="size-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">I'm a Player</h2>
                        <p className="text-sm text-slate-400">Track and improve your game</p>
                      </div>
                   </div>

                   <ul className="space-y-2.5 text-sm text-slate-300">
                      <li className="flex items-center gap-2.5">
                        <Target className="size-4 text-blue-400 shrink-0" />
                        <span>Log and analyse every shot type</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <TrendingUp className="size-4 text-blue-400 shrink-0" />
                        <span>Track progress with charts and stats</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Utensils className="size-4 text-blue-400 shrink-0" />
                        <span>Nutrition and macro tracking</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Activity className="size-4 text-blue-400 shrink-0" />
                        <span>Wellbeing, sleep and energy monitoring</span>
                      </li>
                   </ul>

                   <Button
                      onClick={() => handleLogin("player")}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-base"
                      data-testid="button-login-player"
                   >
                      Sign In as Player
                   </Button>
                </Card>

                <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 p-6 shadow-2xl space-y-5" data-testid="card-coach-login">
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                        <Users className="size-5 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">I'm a Coach</h2>
                        <p className="text-sm text-slate-400">Guide and monitor your players</p>
                      </div>
                   </div>

                   <ul className="space-y-2.5 text-sm text-slate-300">
                      <li className="flex items-center gap-2.5">
                        <ClipboardList className="size-4 text-indigo-400 shrink-0" />
                        <span>View all your players' performance</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <BarChart3 className="size-4 text-indigo-400 shrink-0" />
                        <span>Shots, sessions and wellbeing data</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <Target className="size-4 text-indigo-400 shrink-0" />
                        <span>Manage tactics and training plans</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <TrendingUp className="size-4 text-indigo-400 shrink-0" />
                        <span>Track player progress over time</span>
                      </li>
                   </ul>

                   <Button
                      onClick={() => handleLogin("coach")}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 font-semibold text-base"
                      data-testid="button-login-coach"
                   >
                      Sign In as Coach
                   </Button>
                </Card>
             </div>

             <p className="text-xs text-slate-600 text-center">
               By continuing, you agree to our Terms of Service and Privacy Policy.
             </p>
          </div>
       </div>
    </div>
  );
}
