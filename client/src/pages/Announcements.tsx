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
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Announcements() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [isPinned, setIsPinned] = useState<"yes" | "no">("no");

  const { data: announcements = [], isLoading } = trpc.announcements.list.useQuery();
  const utils = trpc.useUtils();

  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement posted!");
      setIsOpen(false);
      resetForm();
      utils.announcements.list.invalidate();
    },
  });

  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted!");
      utils.announcements.list.invalidate();
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("medium");
    setCategory("");
    setIsPinned("no");
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createAnnouncement.mutate({
      title,
      content,
      priority,
      category: category || undefined,
      isPinned,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-destructive bg-destructive/5";
      case "medium":
        return "border-secondary bg-secondary/5";
      default:
        return "border-border";
    }
  };

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned === "yes");
  const regularAnnouncements = announcements.filter((a) => a.isPinned === "no");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground mt-1">
              Important updates and communications for your team
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Share important updates with your team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Product Launch Update"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Message *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your announcement..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Product, HR"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="isPinned">Pin Announcement</Label>
                  <Select value={isPinned} onValueChange={(v: any) => setIsPinned(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes - Pin to top</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createAnnouncement.isPending}>
                  Post Announcement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pin className="h-5 w-5" />
              Pinned Announcements
            </h2>
            {pinnedAnnouncements.map((announcement) => (
              <Card key={announcement.id} className={getPriorityColor(announcement.priority)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        <CardTitle>{announcement.title}</CardTitle>
                        {announcement.category && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {announcement.category}
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-3">{announcement.content}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnnouncement.mutate({ id: announcement.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Posted {new Date(announcement.createdAt!).toLocaleDateString()} •{" "}
                    {announcement.priority.toUpperCase()} Priority
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Regular Announcements */}
        <div className="space-y-3">
          {pinnedAnnouncements.length > 0 && (
            <h2 className="text-xl font-semibold">All Announcements</h2>
          )}
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading announcements...
              </CardContent>
            </Card>
          ) : regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No announcements yet. Create your first announcement!
              </CardContent>
            </Card>
          ) : (
            regularAnnouncements.map((announcement) => (
              <Card key={announcement.id} className={getPriorityColor(announcement.priority)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{announcement.title}</CardTitle>
                        {announcement.category && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                            {announcement.category}
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-3">{announcement.content}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnnouncement.mutate({ id: announcement.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Posted {new Date(announcement.createdAt!).toLocaleDateString()} •{" "}
                    {announcement.priority.toUpperCase()} Priority
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

