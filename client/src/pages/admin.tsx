import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { 
  useTactics, useCreateTactic, useDeleteTactic,
  useVideos, useCreateVideo, useDeleteVideo,
  useStrengthPlans, useCreateStrengthPlan, useDeleteStrengthPlan
} from "@/hooks/use-padel-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, BookOpen, Video, Dumbbell, Settings } from "lucide-react";

export default function AdminPage() {
  const { data: tactics } = useTactics();
  const { mutate: createTactic, isPending: isCreatingTactic } = useCreateTactic();
  const { mutate: deleteTactic } = useDeleteTactic();

  const { data: videos } = useVideos();
  const { mutate: createVideo, isPending: isCreatingVideo } = useCreateVideo();
  const { mutate: deleteVideo } = useDeleteVideo();

  const [tacticDialog, setTacticDialog] = useState(false);
  const [tacticTitle, setTacticTitle] = useState("");
  const [tacticDesc, setTacticDesc] = useState("");
  const [tacticDiff, setTacticDiff] = useState("");

  const [videoDialog, setVideoDialog] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleCreateTactic = () => {
    if (!tacticTitle || !tacticDesc || !tacticDiff) return;
    createTactic({ title: tacticTitle, description: tacticDesc, difficulty: tacticDiff }, {
      onSuccess: () => { setTacticDialog(false); setTacticTitle(""); setTacticDesc(""); setTacticDiff(""); }
    });
  };

  const handleCreateVideo = () => {
    if (!videoTitle || !videoDuration || !videoCategory) return;
    createVideo({ title: videoTitle, duration: videoDuration, category: videoCategory, url: videoUrl || undefined }, {
      onSuccess: () => { setVideoDialog(false); setVideoTitle(""); setVideoDuration(""); setVideoCategory(""); setVideoUrl(""); }
    });
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-admin-title">
            <span className="inline-flex items-center gap-3">
              <Settings className="size-8 text-rose-400" />
              Admin Panel
            </span>
          </h1>
          <p className="text-slate-400">Manage tactics, videos, and shared content.</p>
        </div>

        <Tabs defaultValue="tactics" className="w-full">
          <TabsList className="bg-slate-900/60 border border-slate-800" data-testid="tabs-admin">
            <TabsTrigger value="tactics" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <BookOpen className="size-4 mr-2" /> Tactics
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              <Video className="size-4 mr-2" /> Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tactics" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Dialog open={tacticDialog} onOpenChange={setTacticDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-tactic">
                    <Plus className="size-4 mr-2" /> Add Tactic
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle>New Tactical Concept</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Title</label>
                      <Input placeholder="e.g. The Australian Formation" value={tacticTitle} onChange={(e) => setTacticTitle(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-tactic-title" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Description</label>
                      <textarea
                        placeholder="Describe the tactic..."
                        value={tacticDesc}
                        onChange={(e) => setTacticDesc(e.target.value)}
                        rows={3}
                        className="w-full rounded-md bg-slate-800 border border-slate-700 text-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="input-tactic-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Difficulty</label>
                      <Select value={tacticDiff} onValueChange={setTacticDiff}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-tactic-difficulty">
                          <SelectValue placeholder="Select difficulty..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateTactic} disabled={isCreatingTactic || !tacticTitle || !tacticDesc || !tacticDiff} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-tactic">
                      {isCreatingTactic ? <Loader2 className="size-4 animate-spin" /> : "Add Tactic"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {tactics?.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/40">
                <CardContent className="flex flex-col items-center py-12 text-slate-500">
                  <BookOpen className="size-10 mb-3 text-slate-700" />
                  <p>No tactics. Add one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tactics?.map((t) => (
                  <Card key={t.id} className="border-slate-800 bg-slate-900/40" data-testid={`admin-tactic-${t.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white truncate">{t.title}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">{t.difficulty}</span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{t.description}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteTactic(t.id)} className="text-slate-500 hover:text-rose-400 shrink-0" data-testid={`button-delete-tactic-${t.id}`}>
                        <Trash2 className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Dialog open={videoDialog} onOpenChange={setVideoDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-video">
                    <Plus className="size-4 mr-2" /> Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle>New Video</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Title</label>
                      <Input placeholder="e.g. Bandeja Masterclass" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-title" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Duration</label>
                        <Input placeholder="12:45" value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-duration" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <Input placeholder="Technique" value={videoCategory} onChange={(e) => setVideoCategory(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-category" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">URL (optional)</label>
                      <Input placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="bg-slate-800 border-slate-700 text-white" data-testid="input-video-url" />
                    </div>
                    <Button onClick={handleCreateVideo} disabled={isCreatingVideo || !videoTitle || !videoDuration || !videoCategory} className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-video">
                      {isCreatingVideo ? <Loader2 className="size-4 animate-spin" /> : "Add Video"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {videos?.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/40">
                <CardContent className="flex flex-col items-center py-12 text-slate-500">
                  <Video className="size-10 mb-3 text-slate-700" />
                  <p>No videos. Add one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {videos?.map((v) => (
                  <Card key={v.id} className="border-slate-800 bg-slate-900/40" data-testid={`admin-video-${v.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium text-white">{v.title}</h4>
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{v.category}</span>
                          <span className="text-xs text-slate-500">{v.duration}</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteVideo(v.id)} className="text-slate-500 hover:text-rose-400 shrink-0" data-testid={`button-delete-video-${v.id}`}>
                        <Trash2 className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}
