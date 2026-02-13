import { LayoutShell } from "@/components/layout-shell";
import { useVideos } from "@/hooks/use-padel-data";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Clock } from "lucide-react";

export default function LibraryPage() {
  const { data: videos, isLoading } = useVideos();

  // Mock data if empty
  const displayVideos = videos?.length ? videos : [
    { id: 1, title: "Mastering the Bandeja", duration: "12:30", category: "Technique", url: "#" },
    { id: 2, title: "Defensive Lobs Explained", duration: "08:45", category: "Tactics", url: "#" },
    { id: 3, title: "Net Positioning 101", duration: "15:20", category: "Positioning", url: "#" },
    { id: 4, title: "The Perfect Serve", duration: "10:15", category: "Technique", url: "#" },
    { id: 5, title: "Reading Your Opponent", duration: "18:00", category: "Tactics", url: "#" },
    { id: 6, title: "Glass Defense Drills", duration: "14:10", category: "Drills", url: "#" },
  ];

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Video Library</h1>
          <p className="text-slate-400">Curated content to improve your understanding of the game.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVideos.map((video) => (
            <Card key={video.id} className="group border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                {/* Placeholder thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                <PlayCircle className="size-12 text-white/80 group-hover:text-blue-400 group-hover:scale-110 transition-all z-10" />
                <span className="absolute bottom-3 right-3 text-xs font-medium bg-black/60 px-2 py-1 rounded text-white flex items-center gap-1">
                  <Clock className="size-3" /> {video.duration}
                </span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {video.category}
                  </span>
                </div>
                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                  {video.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
