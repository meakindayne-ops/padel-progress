import { LayoutShell } from "@/components/layout-shell";
import { useShots, useUpsertShot } from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Minus, TrendingDown, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SHOT_TYPES = [
  "Forehand", "Backhand", "Volley (FH)", "Volley (BH)", 
  "Smash (Flat)", "Smash (X3)", "Bandeja", "Vibora", 
  "Lob", "Bajada", "Chiquita"
];

export default function ShotsPage() {
  const { data: shots } = useShots();
  const { mutate: upsertShot, isPending } = useUpsertShot();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState("");
  const [level, setLevel] = useState(5);

  const handleUpdate = () => {
    if (!selectedShot) return;
    upsertShot({
      key: selectedShot.toLowerCase().replace(/\s+/g, '-'),
      label: selectedShot,
      level: level,
      trend: "flat" // In a real app, calculate based on history
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectedShot("");
        setLevel(5);
      }
    });
  };

  const chartData = shots?.map(s => ({
    name: s.label,
    level: s.level,
    trend: s.trend
  })) || [];

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Technical Analysis</h1>
            <p className="text-slate-400">Track your confidence and skill level for every shot.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="size-4 mr-2" /> Update Shot
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>Update Shot Level</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Shot Type</label>
                  <Select value={selectedShot} onValueChange={setSelectedShot}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select shot..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {SHOT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Current Level (1-10)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={level} 
                      onChange={(e) => setLevel(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-bold text-lg w-8 text-center">{level}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleUpdate} 
                  disabled={isPending || !selectedShot}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save Update"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <Card className="lg:col-span-3 border-slate-800 bg-slate-900/40 backdrop-blur-sm">
             <CardHeader>
               <CardTitle className="text-white">Skill Distribution</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b'}} domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                        itemStyle={{ color: '#f8fafc' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      />
                      <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.level >= 8 ? '#10b981' : entry.level >= 5 ? '#3b82f6' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </CardContent>
          </Card>

          {/* Shot Cards Grid */}
          {shots?.map((shot) => (
             <Card key={shot.id} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700 transition-colors">
                <CardContent className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-white">{shot.label}</h3>
                        <p className="text-sm text-slate-400 capitalize">Level {shot.level}/10</p>
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg bg-slate-800",
                        shot.trend === 'up' ? "text-emerald-400" : shot.trend === 'down' ? "text-rose-400" : "text-slate-400"
                      )}>
                        {shot.trend === 'up' ? <TrendingUp className="size-4" /> : shot.trend === 'down' ? <TrendingDown className="size-4" /> : <Minus className="size-4" />}
                      </div>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", 
                          shot.level >= 8 ? "bg-emerald-500" : shot.level >= 5 ? "bg-blue-500" : "bg-amber-500"
                        )}
                        style={{ width: `${shot.level * 10}%` }}
                      />
                   </div>
                </CardContent>
             </Card>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
