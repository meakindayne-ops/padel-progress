import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useWellbeing, useCreateWellbeing } from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Heart, Plus, Loader2, Moon, Zap, Brain, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const METRIC_CONFIG = [
  { key: "sleep", label: "Sleep", icon: Moon, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  { key: "energy", label: "Energy", icon: Zap, color: "text-amber-400", bgColor: "bg-amber-500/20" },
  { key: "stress", label: "Stress", icon: Brain, color: "text-rose-400", bgColor: "bg-rose-500/20" },
  { key: "soreness", label: "Soreness", icon: Activity, color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
];

export default function WellbeingPage() {
  const { data: entries, isLoading } = useWellbeing();
  const { mutate: createEntry, isPending } = useCreateWellbeing();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [stress, setStress] = useState(3);
  const [soreness, setSoreness] = useState(3);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    createEntry({ sleep, energy, stress, soreness, notes: notes || undefined }, {
      onSuccess: () => {
        setDialogOpen(false);
        setSleep(7); setEnergy(7); setStress(3); setSoreness(3); setNotes("");
      }
    });
  };

  const latestEntry = entries?.[entries.length - 1];

  const radarData = latestEntry ? [
    { metric: "Sleep", value: latestEntry.sleep || 0 },
    { metric: "Energy", value: latestEntry.energy || 0 },
    { metric: "Stress", value: 10 - (latestEntry.stress || 0) },
    { metric: "Recovery", value: 10 - (latestEntry.soreness || 0) },
  ] : [];

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-wellbeing-title">Wellbeing</h1>
            <p className="text-slate-400">Monitor your daily wellness metrics for peak performance.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-daily-checkin">
                <Plus className="size-4 mr-2" /> Daily Check-in
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Daily Wellbeing Check-in</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                {[
                  { label: "Sleep Quality", value: sleep, setter: setSleep, testId: "slider-sleep" },
                  { label: "Energy Level", value: energy, setter: setEnergy, testId: "slider-energy" },
                  { label: "Stress Level", value: stress, setter: setStress, testId: "slider-stress" },
                  { label: "Muscle Soreness", value: soreness, setter: setSoreness, testId: "slider-soreness" },
                ].map(({ label, value, setter, testId }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium text-slate-300">{label}</label>
                      <span className="text-sm font-bold text-white">{value}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      className="w-full accent-blue-500"
                      data-testid={testId}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
                  <Input
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-wellbeing-notes"
                  />
                </div>
                <Button onClick={handleSubmit} disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-checkin">
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Check-in"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-blue-500" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {METRIC_CONFIG.map(({ key, label, icon: Icon, color, bgColor }) => {
                const val = latestEntry ? (latestEntry as any)[key] || 0 : 0;
                return (
                  <Card key={key} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid={`card-metric-${key}`}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-10 rounded-lg flex items-center justify-center", bgColor, color)}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
                          <p className="text-2xl font-bold text-white">{val}<span className="text-sm text-slate-500">/10</span></p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Wellness Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  {radarData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Heart className="size-10 mx-auto mb-3 text-slate-700" />
                      <p>Complete your first check-in to see your radar.</p>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full" data-testid="chart-wellness-radar">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#1e293b" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b' }} />
                          <Radar name="Wellness" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Recent Check-ins</CardTitle>
                </CardHeader>
                <CardContent>
                  {!entries || entries.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No entries yet.</div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {[...entries].reverse().slice(0, 10).map((entry) => (
                        <div key={entry.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30" data-testid={`row-wellbeing-${entry.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                              {entry.date ? format(new Date(entry.date), "MMM d, yyyy") : "No date"}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-400">
                            <span>Sleep: {entry.sleep}</span>
                            <span>Energy: {entry.energy}</span>
                            <span>Stress: {entry.stress}</span>
                            <span>Soreness: {entry.soreness}</span>
                          </div>
                          {entry.notes && <p className="text-xs text-slate-500 mt-2 italic">{entry.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
