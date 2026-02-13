import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-padel-data";
import { Loader2 } from "lucide-react";

import LoginPage from "@/pages/login";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import ShotsPage from "@/pages/shots";
import LibraryPage from "@/pages/library";
import SNCPage from "@/pages/snc";
import ProgressPage from "@/pages/progress";
import NutritionPage from "@/pages/nutrition";
import WellbeingPage from "@/pages/wellbeing";
import TacticsPage from "@/pages/tactics";
import AdminPage from "@/pages/admin";
import CoachDashboardPage from "@/pages/coach-dashboard";
import PlayerDetailPage from "@/pages/player-detail";
import FeedbackPage from "@/pages/feedback";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return <OnboardingPage />;
  }

  if (profile.role === "coach") {
    return (
      <Switch>
        <Route path="/" component={CoachDashboardPage} />
        <Route path="/players" component={CoachDashboardPage} />
        <Route path="/players/:id" component={PlayerDetailPage} />
        <Route path="/library" component={LibraryPage} />
        <Route path="/tactic" component={TacticsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/shots" component={ShotsPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/snc" component={SNCPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/nutrition" component={NutritionPage} />
      <Route path="/wellbeing" component={WellbeingPage} />
      <Route path="/tactic" component={TacticsPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
