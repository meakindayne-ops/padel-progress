import { LayoutShell } from "@/components/layout-shell";
import { useTactics } from "@/hooks/use-padel-data";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Loader2, Shield, Swords, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const difficultyConfig: Record<string, { icon: typeof Shield; color: string; bgColor: string; borderColor: string }> = {
  Basic: { icon: Shield, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  Intermediate: { icon: Swords, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  Advanced: { icon: Crown, color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
  Pro: { icon: Crown, color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30" },
};

export default function TacticsPage() {
  const { data: tactics, isLoading } = useTactics();

  const groupedByDifficulty = ["Basic", "Intermediate", "Advanced", "Pro"]
    .map(d => ({
      difficulty: d,
      items: tactics?.filter(t => t.difficulty === d) || []
    }))
    .filter(g => g.items.length > 0);

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-tactics-title">Tactical Playbook</h1>
          <p className="text-slate-400">Master these concepts to elevate your game strategy.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-blue-500" /></div>
        ) : tactics?.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
              <BookOpen className="size-12 mb-4 text-slate-700" />
              <p className="text-lg font-medium text-slate-300 mb-1">No tactics yet</p>
              <p className="text-sm">Tactics can be added from the Admin panel.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedByDifficulty.map(({ difficulty, items }) => {
              const config = difficultyConfig[difficulty] || difficultyConfig.Basic;
              const DiffIcon = config.icon;
              return (
                <div key={difficulty}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("size-8 rounded-lg flex items-center justify-center", config.bgColor, config.color)}>
                      <DiffIcon className="size-4" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">{difficulty}</h2>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{items.length} plays</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((tactic) => (
                      <Card 
                        key={tactic.id} 
                        className={cn(
                          "border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors",
                        )}
                        data-testid={`card-tactic-${tactic.id}`}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className="font-bold text-white">{tactic.title}</h3>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
                              config.bgColor, config.color
                            )}>
                              {tactic.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed">{tactic.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
