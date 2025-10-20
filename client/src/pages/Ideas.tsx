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
import { Lightbulb, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Ideas() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"innovation" | "process" | "product" | "marketing">("innovation");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const { data: ideas = [], isLoading } = trpc.ideas.list.useQuery();
  const utils = trpc.useUtils();

  const createIdea = trpc.ideas.create.useMutation({
    onSuccess: () => {
      toast.success("Idea submitted successfully!");
      setIsOpen(false);
      resetForm();
      utils.ideas.list.invalidate();
    },
  });

  const updateStatus = trpc.ideas.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Idea status updated!");
      utils.ideas.list.invalidate();
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("innovation");
    setPriority("medium");
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createIdea.mutate({
      title,
      description,
      category,
      priority,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "implemented":
        return "bg-accent text-accent-foreground";
      case "in_progress":
        return "bg-secondary text-secondary-foreground";
      case "under_review":
        return "bg-primary/10 text-primary";
      case "archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      innovation: "💡",
      process: "⚙️",
      product: "📦",
      marketing: "📢",
    };
    return icons[category] || "💡";
  };

  return (
    <TeamsLayout>
      <div className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Idea Hub</h1>
            <p className="text-muted-foreground mt-1">
              Share your innovative ideas and suggestions
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Submit Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Idea</DialogTitle>
                <DialogDescription>
                  Share your idea to help improve our processes and products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Idea Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Automated time tracking"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your idea... How would this help the team or improve our processes?"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="innovation">Innovation</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createIdea.isPending}>
                  Submit Idea
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ideas Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading ideas...
              </CardContent>
            </Card>
          ) : ideas.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center text-muted-foreground">
                No ideas yet. Be the first to submit an idea!
              </CardContent>
            </Card>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">{getCategoryIcon(idea.category)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <CardDescription className="mt-2">{idea.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {idea.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {idea.priority.toUpperCase()} Priority
                      </span>
                    </div>
                    
                    {user?.role === "admin" && (
                      <Select
                        value={idea.status}
                        onValueChange={(v) => updateStatus.mutate({ id: idea.id, status: v as any })}
                      >
                        <SelectTrigger className={`w-full ${getStatusColor(idea.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="implemented">Implemented</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    
                    {user?.role !== "admin" && (
                      <div className={`rounded-lg px-3 py-2 text-sm font-medium ${getStatusColor(idea.status)}`}>
                        {idea.status.replace("_", " ").toUpperCase()}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(idea.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      </div>
    </TeamsLayout>
  );
}

