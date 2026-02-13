import { LayoutShell } from "@/components/layout-shell";
import { useSessions, useShots } from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, Legend
} from "recharts";
import { BarChart2, Calendar, Clock, TrendingUp, Loader2 } from "lucide-react";
import { format, subDays, isAfter } from "date-fns";

export default function ProgressPage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: shots, isLoading: shotsLoading } = useShots();

  const isLoading = sessionsLoading || shotsLoading;

  const recentSessions = sessions?.filter(s => 
    s.date && isAfter(new Date(s.date), subDays(new Date(), 30))
  ) || [];

  const totalMinutes = recentSessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const avgRating = recentSessions.length > 0
    ? (recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length).toFixed(1)
    : "N/A";

  const sessionsByType = recentSessions.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(sessionsByType).map(([name, value]) => ({ name, value }));
  const typeColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

  const shotChartData = shots?.map(s => ({
    name: s.label,
    level: s.level,
  })) || [];

  const sessionTimelineData = recentSessions
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .map(s => ({
      date: s.date ? format(new Date(s.date), "MMM d") : "",
      rating: s.rating || 0,
      minutes: s.minutes || 0,
    }));

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-progress-title">Progress Tracking</h1>
          <p className="text-slate-400">Analyze your performance trends over the past 30 days.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid="stat-total-sessions">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sessions</p>
                      <p className="text-2xl font-bold text-white">{recentSessions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid="stat-total-minutes">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Minutes</p>
                      <p className="text-2xl font-bold text-white">{totalMinutes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid="stat-avg-rating">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Avg Rating</p>
                      <p className="text-2xl font-bold text-white">{avgRating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid="stat-shot-count">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <BarChart2 className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Shots Tracked</p>
                      <p className="text-2xl font-bold text-white">{shots?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Session Ratings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionTimelineData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No session data yet. Log sessions to see trends.</div>
                  ) : (
                    <div className="h-[280px] w-full" data-testid="chart-session-ratings">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sessionTimelineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} domain={[0, 5]} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                          <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Session Types Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {typeChartData.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No session data yet.</div>
                  ) : (
                    <div className="h-[280px] w-full" data-testid="chart-session-types">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {typeChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={typeColors[index % typeColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                          <Legend wrapperStyle={{ color: '#94a3b8' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Shot Skill Levels</CardTitle>
              </CardHeader>
              <CardContent>
                {shotChartData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No shot data yet. Track your shots to see levels here.</div>
                ) : (
                  <div className="h-[300px] w-full" data-testid="chart-shot-levels">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shotChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} />
                        <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} domain={[0, 10]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                          {shotChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.level >= 8 ? '#10b981' : entry.level >= 5 ? '#3b82f6' : '#f59e0b'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
