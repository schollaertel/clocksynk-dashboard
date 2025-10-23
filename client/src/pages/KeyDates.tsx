import TeamsLayout from "@/components/TeamsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Calendar as CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KeyDates() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"deadline" | "launch" | "meeting" | "event">("event");
  const [syncToCalendar, setSyncToCalendar] = useState(true);

  const { data: keyDates = [], isLoading } = trpc.keyDates.list.useQuery();
  const { data: googleConnection } = trpc.google.isConnected.useQuery();
  const utils = trpc.useUtils();

  const createKeyDate = trpc.keyDates.create.useMutation({
    onSuccess: async (newKeyDate) => {
      toast.success("Key date added!");
      
      // Sync to Google Calendar if enabled and connected
      if (syncToCalendar && googleConnection?.connected) {
        try {
          await syncToGoogleCalendar.mutateAsync({
            summary: newKeyDate.title,
            description: newKeyDate.description || undefined,
            start: new Date(newKeyDate.date).toISOString(),
            attendees: ["erin@clocksynk.com", "jared@clocksynk.com", "bill@clocksynk.com"],
          });
          toast.success("Synced to Google Calendar!");
        } catch (error) {
          toast.error("Failed to sync to Google Calendar");
        }
      }
      
      setIsOpen(false);
      resetForm();
      utils.keyDates.list.invalidate();
    },
  });

  const deleteKeyDate = trpc.keyDates.delete.useMutation({
    onSuccess: () => {
      toast.success("Key date deleted!");
      utils.keyDates.list.invalidate();
    },
  });

  const syncToGoogleCalendar = trpc.google.calendar.createEvent.useMutation();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setType("event");
    setSyncToCalendar(true);
  };

  const handleCreate = () => {
    if (!title.trim() || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    createKeyDate.mutate({
      title,
      description: description || undefined,
      date: new Date(date),
      type,
    });
  };

  const handleSyncAllToCalendar = async () => {
    if (!googleConnection?.connected) {
      toast.error("Please connect your Google account first");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const keyDate of keyDates) {
      try {
        await syncToGoogleCalendar.mutateAsync({
          summary: `${keyDate.title} (${keyDate.type})`,
          description: keyDate.description || undefined,
          start: new Date(keyDate.date).toISOString(),
          attendees: ["erin@clocksynk.com", "jared@clocksynk.com", "bill@clocksynk.com"],
        });
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Synced ${successCount} events to Google Calendar!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to sync ${failCount} events`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deadline":
        return "bg-destructive text-destructive-foreground";
      case "launch":
        return "bg-accent text-accent-foreground";
      case "meeting":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      deadline: "⏰",
      launch: "🚀",
      meeting: "📅",
      event: "🎯",
    };
    return icons[type] || "📅";
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  return (
    <TeamsLayout>
      <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Key Dates & Milestones</h1>
            <p className="text-muted-foreground mt-1">
              Track important deadlines and upcoming events
            </p>
          </div>
          <div className="flex gap-2">
            {googleConnection?.connected && keyDates.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSyncAllToCalendar}
                disabled={syncToGoogleCalendar.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                Sync All to Calendar
              </Button>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Key Date
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Key Date</DialogTitle>
                  <DialogDescription>Create a new milestone or important date</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Product Launch"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about this event..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="deadline">Deadline</SelectItem>
                          <SelectItem value="launch">Launch</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {googleConnection?.connected && (
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                      <input
                        type="checkbox"
                        id="syncToCalendar"
                        checked={syncToCalendar}
                        onChange={(e) => setSyncToCalendar(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="syncToCalendar" className="text-sm cursor-pointer">
                        Sync to team Google Calendar (Erin, Jared, Bill)
                      </Label>
                    </div>
                  )}
                  
                  {!googleConnection?.connected && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Connect your Google account to sync events to calendar
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={createKeyDate.isPending}>
                    Add Date
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Google Calendar Connection Status */}
        {!googleConnection?.connected && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Connect Google Calendar
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Sync key dates automatically to your team's Google Calendar
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = "/api/oauth/google"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Connect Google
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading key dates...
              </CardContent>
            </Card>
          ) : keyDates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No key dates yet. Add your first milestone!</p>
              </CardContent>
            </Card>
          ) : (
            keyDates
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((keyDate) => (
                <Card key={keyDate.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-3xl">{getTypeIcon(keyDate.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{keyDate.title}</CardTitle>
                            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(keyDate.type)}`}>
                              {keyDate.type}
                            </span>
                          </div>
                          {keyDate.description && (
                            <CardDescription className="mt-2">{keyDate.description}</CardDescription>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {new Date(keyDate.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="font-medium">{getDaysUntil(keyDate.date)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteKeyDate.mutate({ id: keyDate.id })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
          )}
        </div>
      </div>
      </div>
    </TeamsLayout>
  );
}

