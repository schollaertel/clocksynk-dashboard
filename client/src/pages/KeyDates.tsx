import DashboardLayout from "@/components/DashboardLayout";
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
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KeyDates() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"deadline" | "launch" | "meeting" | "event">("event");

  const { data: keyDates = [], isLoading } = trpc.keyDates.list.useQuery();
  const utils = trpc.useUtils();

  const createKeyDate = trpc.keyDates.create.useMutation({
    onSuccess: () => {
      toast.success("Key date added!");
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setType("event");
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Key Dates & Milestones</h1>
            <p className="text-muted-foreground mt-1">
              Track important deadlines and upcoming events
            </p>
          </div>
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
                No key dates yet. Add your first milestone!
              </CardContent>
            </Card>
          ) : (
            keyDates.map((keyDate) => (
              <Card key={keyDate.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {/* Date Box */}
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 p-4 min-w-[80px]">
                      <div className="text-2xl font-bold text-primary">
                        {new Date(keyDate.date).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {new Date(keyDate.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(keyDate.date).getFullYear()}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getTypeIcon(keyDate.type)}</span>
                            <CardTitle>{keyDate.title}</CardTitle>
                          </div>
                          {keyDate.description && (
                            <CardDescription className="mt-2">{keyDate.description}</CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteKeyDate.mutate({ id: keyDate.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(keyDate.type)}`}>
                          {keyDate.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getDaysUntil(keyDate.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

