import { LayoutShell } from "@/components/layout-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  const { data: feedback, isLoading } = useQuery<any[]>({
    queryKey: ["/api/feedback"],
  });

  return (
    <LayoutShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-feedback-heading">
            Coach Feedback
          </h1>
          <p className="text-slate-400">
            Feedback and notes from your coach to help you improve.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-blue-500" />
          </div>
        ) : feedback?.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center">
                <MessageSquare className="size-8 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">No feedback yet</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Your coach hasn't left any feedback yet. Check back later for notes and guidance.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedback?.map((fb: any) => (
              <Card key={fb.id} className="border-slate-800 bg-slate-900/40 backdrop-blur-sm" data-testid={`card-feedback-${fb.id}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded font-medium capitalize ${
                      fb.category === "technique" ? "bg-blue-500/20 text-blue-400" :
                      fb.category === "fitness" ? "bg-emerald-500/20 text-emerald-400" :
                      fb.category === "nutrition" ? "bg-amber-500/20 text-amber-400" :
                      fb.category === "mental" ? "bg-purple-500/20 text-purple-400" :
                      fb.category === "tactics" ? "bg-rose-500/20 text-rose-400" :
                      "bg-slate-700 text-slate-300"
                    }`}>{fb.category}</span>
                    <span className="text-xs text-slate-500">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ""}
                    </span>
                    <span className="text-xs text-slate-600 ml-auto">
                      From {fb.coachName}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{fb.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
