import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-padel-data";
import { 
  LayoutDashboard, Activity, Video, Dumbbell, 
  BarChart2, Apple, Heart, BookOpen, Settings, LogOut, Users, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYER_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Activity, label: "Shots", href: "/shots" },
  { icon: Video, label: "Library", href: "/library" },
  { icon: Dumbbell, label: "SNC", href: "/snc" },
  { icon: BarChart2, label: "Progress", href: "/progress" },
  { icon: Apple, label: "Nutrition", href: "/nutrition" },
  { icon: Heart, label: "Wellbeing", href: "/wellbeing" },
  { icon: BookOpen, label: "Tactics", href: "/tactic" },
  { icon: MessageSquare, label: "Feedback", href: "/feedback" },
];

const COACH_MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "My Players", href: "/players" },
  { icon: Video, label: "Library", href: "/library" },
  { icon: BookOpen, label: "Tactics", href: "/tactic" },
];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { data: profile } = useProfile();

  const isCoach = profile?.role === "coach";
  const menuItems = isCoach ? COACH_MENU_ITEMS : PLAYER_MENU_ITEMS;

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="font-bold text-white text-lg">P</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Padel Progress</span>
          </div>
        </div>

        <div className="flex flex-col justify-between h-[calc(100vh-64px)] p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 shadow-sm shadow-blue-500/5" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <item.icon className={cn("size-4", isActive ? "text-blue-400" : "text-slate-500")} />
                    {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-800/50 pt-4 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                 {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="User" className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-xs font-bold text-slate-400">{user?.firstName?.[0] || "U"}</span>
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{profile?.role || "Player"}</p>
              </div>
            </div>

            {isCoach && (
              <Link href="/admin" className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location === "/admin" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-100"
              )} data-testid="nav-admin">
                <Settings className="size-4" />
                Admin
              </Link>
            )}
            
            <button 
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              data-testid="button-sign-out"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 min-h-screen relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
