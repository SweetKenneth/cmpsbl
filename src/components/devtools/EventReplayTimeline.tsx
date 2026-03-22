import { useState, useEffect } from "react";
import {
  useReplaySessions,
  useReplayEvents,
  useStartRecording,
  useStopRecording,
  useDeleteSession,
} from "@/hooks/useEventReplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Circle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Trash2,
  Clock,
  Zap,
  ChevronRight,
  Plus,
  History,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  recording: "bg-destructive animate-pulse",
  completed: "bg-neon-green",
  playing: "bg-neon-blue animate-pulse",
};

const MODULE_COLORS: Record<string, string> = {
  brain: "text-neon-purple",
  decode: "text-neon-cyan",
  defense: "text-destructive",
  nexus: "text-neon-amber",
  vision: "text-neon-green",
  dream: "text-primary",
  core: "text-neon-blue",
};

export function EventReplayTimeline() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [newSessionName, setNewSessionName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useReplaySessions();
  const { data: events, error: eventsError } = useReplayEvents(selectedSession || undefined);
  const startRecording = useStartRecording();
  const stopRecording = useStopRecording();
  const deleteSession = useDeleteSession();

  // Playback logic
  useEffect(() => {
    if (!isPlaying || !events?.length) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, events, playbackSpeed]);

  const handleStartRecording = async () => {
    if (!newSessionName.trim()) {
      toast.error("Please enter a session name");
      return;
    }
    try {
      const session = await startRecording.mutateAsync({ name: newSessionName });
      if (session?.id) setSelectedSession(session.id);
      setNewSessionName("");
      setDialogOpen(false);
      toast.success("Recording started");
    } catch (error: any) {
      const message = error?.message || "Failed to start recording";
      toast.error("Recording failed", {
        description: message.includes("permission") 
          ? "You may need to sign in or check your permissions."
          : message.includes("relation") || message.includes("does not exist")
            ? "Recording tables are not configured yet."
            : "Please try again later."
      });
    }
  };

  const handleStopRecording = async (sessionId: string) => {
    try {
      await stopRecording.mutateAsync(sessionId);
      toast.success("Recording stopped");
    } catch (error) {
      toast.error("Failed to stop recording");
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      if (selectedSession === sessionId) {
        setSelectedSession(null);
      }
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  const currentEvent = events?.[currentEventIndex];
  const progress = events?.length ? ((currentEventIndex + 1) / events.length) * 100 : 0;

  // Handle error state for missing tables
  if (sessionsError || eventsError) {
    return (
      <Card className="p-8 border-neon-amber/30 bg-neon-amber/5">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-neon-amber/20 flex items-center justify-center">
            <History className="w-6 h-6 text-neon-amber" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Event Replay Unavailable</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              The event replay feature requires database tables that may not be configured yet. 
              This is expected during initial setup.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Session List */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Sessions
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Recording</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Session name..."
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleStartRecording}
                  disabled={startRecording.isPending}
                >
                  <Circle className="h-4 w-4 mr-2 text-destructive fill-destructive" />
                  Start Recording
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {sessionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sessions?.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSession === session.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedSession(session.id);
                      setCurrentEventIndex(0);
                      setIsPlaying(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            STATUS_COLORS[session.status] || "bg-muted"
                          }`}
                        />
                        <span className="font-medium text-sm">{session.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {session.status === "recording" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStopRecording(session.id);
                            }}
                          >
                            <Square className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {session.event_count} events
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(session.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Playback Controls & Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!selectedSession ? (
            <div className="text-center py-12 text-muted-foreground">
              Select a session to view the event timeline
            </div>
          ) : (
            <>
              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentEventIndex(0)}
                  disabled={!events?.length}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!events?.length}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentEventIndex(Math.min(currentEventIndex + 1, (events?.length || 1) - 1))
                  }
                  disabled={!events?.length || currentEventIndex >= (events?.length || 0) - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-muted-foreground">Speed:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-muted border-none rounded px-2 py-1 text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={4}>4x</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Event {currentEventIndex + 1} of {events?.length || 0}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Current Event Detail */}
              {currentEvent && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={MODULE_COLORS[currentEvent.module]}>
                          {currentEvent.module}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{currentEvent.action}</span>
                      </div>
                      <Badge variant="outline">
                        {currentEvent.latency_ms}ms
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Input</h5>
                        <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(currentEvent.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">Output</h5>
                        <pre className="bg-background p-2 rounded text-xs overflow-auto max-h-32">
                          {JSON.stringify(currentEvent.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event List */}
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {events?.map((event, index) => (
                    <div
                      key={event.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all ${
                        index === currentEventIndex
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setCurrentEventIndex(index)}
                    >
                      <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                      <Badge variant="outline" className={`text-xs ${MODULE_COLORS[event.module]}`}>
                        {event.module}
                      </Badge>
                      <span className="font-mono text-xs">{event.action}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {event.latency_ms}ms
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
