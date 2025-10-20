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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, LayoutList, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Tasks() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const { data: tasks = [], isLoading } = trpc.tasks.list.useQuery();
  const utils = trpc.useUtils();

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      setIsOpen(false);
      resetForm();
      utils.tasks.list.invalidate();
    },
  });

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated!");
      utils.tasks.list.invalidate();
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted!");
      utils.tasks.list.invalidate();
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setPriority("medium");
    setDueDate("");
  };

  const handleCreateTask = () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    createTask.mutate({
      title,
      description,
      assignedTo: assignedTo || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  const handleStatusChange = (taskId: string, status: string) => {
    updateTask.mutate({ id: taskId, status: status as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-accent text-accent-foreground";
      case "in_progress":
        return "bg-secondary text-secondary-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-secondary";
      default:
        return "text-muted-foreground";
    }
  };

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    pending: tasks.filter(t => t.status === "pending"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    overdue: tasks.filter(t => t.status === "overdue"),
    done: tasks.filter(t => t.status === "done"),
  };

  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage team tasks and track progress
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a new task for your team</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Complete product roadmap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add details about this task..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Team member name"
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
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask} disabled={createTask.isPending}>
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Task Views */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Tabs defaultValue="board" className="w-full">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start mb-6">
              <TabsTrigger 
                value="board" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger 
                value="list" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <LayoutList className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
            </TabsList>

            {/* Kanban Board View */}
            <TabsContent value="board" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Pending</h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">{tasksByStatus.pending.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.pending.map((task) => (
                      <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">{task.title}</CardTitle>
                          {task.description && (
                            <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</span>
                            {task.dueDate && (
                              <span className="text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          {task.assignedTo && (
                            <p className="text-xs text-muted-foreground">👤 {task.assignedTo}</p>
                          )}
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleStatusChange(task.id, "in_progress")}>
                              Start
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteTask.mutate({ id: task.id })}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* In Progress Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">In Progress</h3>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">{tasksByStatus.in_progress.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.in_progress.map((task) => (
                      <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow border-secondary">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">{task.title}</CardTitle>
                          {task.description && (
                            <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</span>
                            {task.dueDate && (
                              <span className="text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          {task.assignedTo && (
                            <p className="text-xs text-muted-foreground">👤 {task.assignedTo}</p>
                          )}
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleStatusChange(task.id, "done")}>
                              Complete
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteTask.mutate({ id: task.id })}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Overdue Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Overdue</h3>
                    <span className="text-xs bg-destructive px-2 py-1 rounded-full text-destructive-foreground">{tasksByStatus.overdue.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.overdue.map((task) => (
                      <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow border-destructive">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">{task.title}</CardTitle>
                          {task.description && (
                            <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</span>
                            {task.dueDate && (
                              <span className="text-destructive font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          {task.assignedTo && (
                            <p className="text-xs text-muted-foreground">👤 {task.assignedTo}</p>
                          )}
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => handleStatusChange(task.id, "in_progress")}>
                              Resume
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteTask.mutate({ id: task.id })}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Done Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Done</h3>
                    <span className="text-xs bg-accent px-2 py-1 rounded-full text-accent-foreground">{tasksByStatus.done.length}</span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.done.map((task) => (
                      <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow border-accent opacity-75">
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm line-through">{task.title}</CardTitle>
                          {task.description && (
                            <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-accent">COMPLETED</span>
                          </div>
                          {task.assignedTo && (
                            <p className="text-xs text-muted-foreground">👤 {task.assignedTo}</p>
                          )}
                          <Button size="sm" variant="ghost" className="w-full h-7 text-xs" onClick={() => deleteTask.mutate({ id: task.id })}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="mt-0 space-y-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Loading tasks...
                  </CardContent>
                </Card>
              ) : tasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No tasks found. Create your first task to get started!
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          {task.description && (
                            <CardDescription className="mt-2">{task.description}</CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask.mutate({ id: task.id })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center gap-3">
                        <Select
                          value={task.status}
                          onValueChange={(v) => handleStatusChange(task.id, v)}
                        >
                          <SelectTrigger className={`w-32 ${getStatusColor(task.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()} Priority
                        </span>
                        {task.assignedTo && (
                          <span className="text-sm text-muted-foreground">
                            👤 {task.assignedTo}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-sm text-muted-foreground">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Calendar View */}
            <TabsContent value="calendar" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Task Calendar</CardTitle>
                  <CardDescription>View tasks by due date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.filter(t => t.dueDate).sort((a, b) => 
                      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
                    ).map((task) => (
                      <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg border">
                        <div className="flex flex-col items-center justify-center rounded bg-primary/10 p-3 min-w-[60px]">
                          <div className="text-xl font-bold text-primary">
                            {new Date(task.dueDate!).getDate()}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {new Date(task.dueDate!).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.assignedTo || "Unassigned"} • {task.status.replace("_", " ")}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {tasks.filter(t => t.dueDate).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No tasks with due dates
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeamsLayout>
  );
}

