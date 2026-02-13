import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useStrengthPlans, useCreateStrengthPlan, useDeleteStrengthPlan } from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SNCPage() {
  const { data: plans, isLoading } = useStrengthPlans();
  const { mutate: createPlan, isPending: isCreating } = useCreateStrengthPlan();
  const { mutate: deletePlan } = useDeleteStrengthPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [day, setDay] = useState("");
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState("");
  const [notes, setNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCreate = () => {
    const items = exercises.split("\n").map(s => s.trim()).filter(Boolean);
    if (!day || !title || items.length === 0) return;
    createPlan({ day, title, items, notes: notes || undefined }, {
      onSuccess: () => {
        setDialogOpen(false);
        setDay("");
        setTitle("");
        setExercises("");
        setNotes("");
      }
    });
  };

  const toggleCheck = (planId: number, itemIdx: number) => {
    const key = `${planId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groupedByDay = DAYS.map(d => ({
    day: d,
    plans: plans?.filter(p => p.day === d) || []
  })).filter(g => g.plans.length > 0);

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-snc-title">Strength & Conditioning</h1>
            <p className="text-slate-400">Your weekly training plan for off-court performance.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-plan">
                <Plus className="size-4 mr-2" /> Add Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>New Workout Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Day</label>
                  <Select value={day} onValueChange={setDay}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-day">
                      <SelectValue placeholder="Select day..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Workout Title</label>
                  <Input
                    placeholder="e.g. Upper Body Power"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-workout-title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Exercises (one per line)</label>
                  <textarea
                    placeholder={"Shoulder Press 3x10\nMed Ball Slams 3x12\nFace Pulls 3x15"}
                    value={exercises}
                    onChange={(e) => setExercises(e.target.value)}
                    rows={5}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 text-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="input-exercises"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Notes (optional)</label>
                  <Input
                    placeholder="e.g. Focus on explosive movements"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-notes"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !day || !title || !exercises.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-save-workout"
                >
                  {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Save Workout"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-blue-500" />
          </div>
        ) : groupedByDay.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Dumbbell className="size-12 mb-4 text-slate-700" />
              <p className="text-lg font-medium text-slate-300 mb-1">No workout plans yet</p>
              <p className="text-sm">Add your first strength & conditioning workout above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedByDay.map(({ day: dayName, plans: dayPlans }) =>
              dayPlans.map((plan) => (
                <Card key={plan.id} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm group" data-testid={`card-plan-${plan.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">{plan.day}</div>
                      <CardTitle className="text-white text-lg">{plan.title}</CardTitle>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deletePlan(plan.id)}
                      className="text-slate-500 hover:text-rose-400"
                      data-testid={`button-delete-plan-${plan.id}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(plan.items as string[]).map((item, idx) => {
                      const isChecked = checkedItems[`${plan.id}-${idx}`];
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleCheck(plan.id, idx)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all",
                            isChecked
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50"
                          )}
                          data-testid={`button-exercise-${plan.id}-${idx}`}
                        >
                          <div className={cn(
                            "size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            isChecked ? "bg-emerald-500 border-emerald-500 text-black" : "border-slate-600"
                          )}>
                            {isChecked && <CheckCircle2 className="size-3" />}
                          </div>
                          <span className={cn(
                            "transition-colors",
                            isChecked ? "text-emerald-300 line-through" : "text-slate-300"
                          )}>
                            {item}
                          </span>
                        </button>
                      );
                    })}
                    {plan.notes && (
                      <p className="text-xs text-slate-500 mt-3 italic pt-2 border-t border-slate-800">
                        {plan.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
