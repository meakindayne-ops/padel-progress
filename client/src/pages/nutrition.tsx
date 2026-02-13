import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useNutritionLogs, useCreateNutritionLog, useNutritionGoal, useUpsertNutritionGoal } from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Apple, Plus, Loader2, Target, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function NutritionPage() {
  const { data: logs, isLoading } = useNutritionLogs();
  const { data: goal } = useNutritionGoal();
  const { mutate: createLog, isPending: isCreatingLog } = useCreateNutritionLog();
  const { mutate: upsertGoal, isPending: isSavingGoal } = useUpsertNutritionGoal();

  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState("");

  const [targetCalories, setTargetCalories] = useState(goal?.calories?.toString() || "2800");
  const [targetProtein, setTargetProtein] = useState(goal?.protein?.toString() || "180");
  const [targetCarbs, setTargetCarbs] = useState(goal?.carbs?.toString() || "350");
  const [targetFat, setTargetFat] = useState(goal?.fat?.toString() || "70");

  const handleCreateLog = () => {
    if (!name || !calories || !mealType) return;
    createLog({
      name,
      calories: parseInt(calories),
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      mealType,
    }, {
      onSuccess: () => {
        setLogDialogOpen(false);
        setName(""); setCalories(""); setProtein(""); setCarbs(""); setFat(""); setMealType("");
      }
    });
  };

  const handleSaveGoal = () => {
    upsertGoal({
      calories: parseInt(targetCalories) || 2800,
      protein: parseInt(targetProtein) || 180,
      carbs: parseInt(targetCarbs) || 350,
      fat: parseInt(targetFat) || 70,
    }, {
      onSuccess: () => setGoalDialogOpen(false)
    });
  };

  const todayLogs = logs?.filter(l => {
    if (!l.date) return false;
    const d = new Date(l.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }) || [];

  const todayTotals = todayLogs.reduce((acc, l) => ({
    calories: acc.calories + l.calories,
    protein: acc.protein + l.protein,
    carbs: acc.carbs + l.carbs,
    fat: acc.fat + l.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targets = {
    calories: goal?.calories || 2800,
    protein: goal?.protein || 180,
    carbs: goal?.carbs || 350,
    fat: goal?.fat || 70,
  };

  const macroData = [
    { label: "Calories", current: todayTotals.calories, target: targets.calories, unit: "kcal", color: "bg-indigo-500" },
    { label: "Protein", current: todayTotals.protein, target: targets.protein, unit: "g", color: "bg-rose-500" },
    { label: "Carbs", current: todayTotals.carbs, target: targets.carbs, unit: "g", color: "bg-amber-500" },
    { label: "Fat", current: todayTotals.fat, target: targets.fat, unit: "g", color: "bg-emerald-500" },
  ];

  const mealTypeColors: Record<string, string> = {
    Breakfast: "text-amber-400 bg-amber-500/10",
    Lunch: "text-emerald-400 bg-emerald-500/10",
    Dinner: "text-indigo-400 bg-indigo-500/10",
    Snack: "text-rose-400 bg-rose-500/10",
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-nutrition-title">Nutrition</h1>
            <p className="text-slate-400">Track your daily intake and hit your macro targets.</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300" data-testid="button-set-targets">
                  <Target className="size-4 mr-2" /> Set Targets
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Daily Macro Targets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Calories (kcal)</label>
                      <Input value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-target-calories" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Protein (g)</label>
                      <Input value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-target-protein" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Carbs (g)</label>
                      <Input value={targetCarbs} onChange={(e) => setTargetCarbs(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-target-carbs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Fat (g)</label>
                      <Input value={targetFat} onChange={(e) => setTargetFat(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-target-fat" />
                    </div>
                  </div>
                  <Button onClick={handleSaveGoal} disabled={isSavingGoal} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-targets">
                    {isSavingGoal ? <Loader2 className="size-4 animate-spin" /> : "Save Targets"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-log-meal">
                  <Plus className="size-4 mr-2" /> Log Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Log Food Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Food Name</label>
                    <Input placeholder="e.g. Grilled Chicken Breast" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-food-name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Meal Type</label>
                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-meal-type">
                        <SelectValue placeholder="Select meal type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        {MEAL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Calories</label>
                      <Input type="number" placeholder="350" value={calories} onChange={(e) => setCalories(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-calories" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Protein (g)</label>
                      <Input type="number" placeholder="40" value={protein} onChange={(e) => setProtein(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-protein" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Carbs (g)</label>
                      <Input type="number" placeholder="30" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-carbs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Fat (g)</label>
                      <Input type="number" placeholder="10" value={fat} onChange={(e) => setFat(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-fat" />
                    </div>
                  </div>
                  <Button onClick={handleCreateLog} disabled={isCreatingLog || !name || !calories || !mealType} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-meal">
                    {isCreatingLog ? <Loader2 className="size-4 animate-spin" /> : "Log Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-blue-500" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {macroData.map((macro) => {
                const pct = Math.min(100, Math.round((macro.current / macro.target) * 100));
                return (
                  <Card key={macro.label} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid={`card-macro-${macro.label.toLowerCase()}`}>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-400">{macro.label}</span>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {macro.current} <span className="text-sm font-normal text-slate-500">/ {macro.target} {macro.unit}</span>
                      </div>
                      <Progress value={pct} className={cn("h-2 bg-slate-800", `[&>div]:${macro.color}`)} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Utensils className="size-5 text-blue-400" />
                  Today's Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Apple className="size-10 mx-auto mb-3 text-slate-700" />
                    <p>No meals logged today. Start tracking!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30" data-testid={`row-meal-${log.id}`}>
                        <div className="flex items-center gap-4">
                          <span className={cn("text-xs font-bold px-2 py-1 rounded-full", mealTypeColors[log.mealType] || "text-slate-400 bg-slate-800")}>
                            {log.mealType}
                          </span>
                          <div>
                            <p className="font-medium text-white">{log.name}</p>
                            <p className="text-xs text-slate-500">{log.calories} kcal</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>P: {log.protein}g</span>
                          <span>C: {log.carbs}g</span>
                          <span>F: {log.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {goal?.coachSuggestions && (
              <Card className="border-slate-800 bg-gradient-to-br from-amber-900/20 to-slate-900/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Coach Suggestion</p>
                  <p className="text-slate-300">{goal.coachSuggestions}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </LayoutShell>
  );
}
