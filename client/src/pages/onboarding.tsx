import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-padel-data";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const [selectedRole, setSelectedRole] = useState<"player" | "coach" | null>(null);
  const [name, setName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || ""
  );

  const { data: pendingRoleData } = useQuery({
    queryKey: ["/api/pending-role"],
    queryFn: async () => {
      const res = await fetch("/api/pending-role");
      if (!res.ok) return { role: null };
      return res.json();
    },
  });

  useEffect(() => {
    if (pendingRoleData?.role && !selectedRole) {
      setSelectedRole(pendingRoleData.role);
    }
  }, [pendingRoleData, selectedRole]);

  const handleSubmit = () => {
    if (!selectedRole || !name.trim()) return;
    updateProfile({ name: name.trim(), role: selectedRole });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-2xl">P</span>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white" data-testid="text-onboarding-title">
            Welcome to Padel Progress
          </h1>
          <p className="text-slate-400">
            Let's set up your account. Tell us your name and how you'll use the app.
          </p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 p-6 shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Your Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-slate-800 border-slate-700 text-white"
              data-testid="input-name"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedRole("player")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  selectedRole === "player"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600"
                )}
                data-testid="button-role-player"
              >
                <User className="size-8" />
                <div className="text-center">
                  <p className="font-semibold text-white">Player</p>
                  <p className="text-xs mt-1">Track my own progress, shots, nutrition, and fitness</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole("coach")}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  selectedRole === "coach"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600"
                )}
                data-testid="button-role-coach"
              >
                <Users className="size-8" />
                <div className="text-center">
                  <p className="font-semibold text-white">Coach</p>
                  <p className="text-xs mt-1">Monitor my players' progress and provide feedback</p>
                </div>
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !selectedRole || !name.trim()}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-base"
            data-testid="button-continue"
          >
            {isPending ? <Loader2 className="size-5 animate-spin" /> : "Continue"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
