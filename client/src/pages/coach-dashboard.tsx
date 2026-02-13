import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Trash2, ChevronRight, Loader2, Users, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface PlayerInfo {
  playerUserId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  role: string | null;
  level: number | null;
}

function useCoachPlayers() {
  return useQuery<PlayerInfo[]>({
    queryKey: ["/api/coach/players"],
    queryFn: async () => {
      const res = await fetch("/api/coach/players");
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });
}

function useAddPlayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/coach/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add player");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/players"] });
      toast({ title: "Player added successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not add player", description: err.message, variant: "destructive" });
    },
  });
}

function useRemovePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playerUserId: string) => {
      const res = await fetch(`/api/coach/players/${playerUserId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove player");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/coach/players"] }),
  });
}

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const { data: players, isLoading } = useCoachPlayers();
  const { mutate: addPlayer, isPending: isAdding } = useAddPlayer();
  const { mutate: removePlayer } = useRemovePlayer();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddPlayer = () => {
    if (!email.trim()) return;
    addPlayer(email.trim(), {
      onSuccess: () => {
        setEmail("");
        setDialogOpen(false);
      },
    });
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-coach-heading">
              Coach Dashboard
            </h1>
            <p className="text-slate-400">
              Welcome back, <span className="text-blue-400">{user?.firstName}</span>. Manage your players and track their progress.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-700 text-slate-300" data-testid="button-add-player">
                <UserPlus className="size-4 mr-2" /> Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Add a Player</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-400">
                  Enter the email address of a player who has already signed up. They will appear in your player list.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Player Email</label>
                  <Input
                    placeholder="player@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-player-email"
                  />
                </div>
                <Button
                  onClick={handleAddPlayer}
                  disabled={isAdding || !email.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-confirm-add-player"
                >
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : "Add Player"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-blue-500" />
          </div>
        ) : players?.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center">
                <Users className="size-8 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">No players yet</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Add players by their email address to start tracking their progress and providing feedback.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players?.map((player) => (
              <Card
                key={player.playerUserId}
                className="border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors cursor-pointer group"
                data-testid={`card-player-${player.playerUserId}`}
                onClick={() => setLocation(`/players/${player.playerUserId}`)}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {player.profileImageUrl ? (
                          <img src={player.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-slate-400">
                            {player.firstName?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                          {player.firstName} {player.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Mail className="size-3" />
                          {player.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-500 hover:text-rose-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlayer(player.playerUserId);
                        }}
                        data-testid={`button-remove-player-${player.playerUserId}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <ChevronRight className="size-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                  {player.level && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-500">
                        Level: <span className="text-slate-300 font-medium">{player.level.toFixed(1)}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
