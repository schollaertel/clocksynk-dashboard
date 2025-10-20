import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const [focusText, setFocusText] = useState("");
  
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: todaysFocus = [] } = trpc.dailyFocus.today.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const { data: keyDates = [] } = trpc.keyDates.list.useQuery();

  const createFocus = trpc.dailyFocus.create.useMutation({
    onSuccess: () => {
      toast.success("Daily focus saved!");
      setFocusText("");
      trpc.useUtils().dailyFocus.today.invalidate();
    },
  });

  const handleSubmitFocus = () => {
    if (!focusText.trim()) return;
    createFocus.mutate({ focusText });
  };

  // Calculate metrics
  const overdueTasks = tasks.filter(t => t.status === "overdue").length;
  const urgentTasks = tasks.filter(t => t.priority === "high" && t.status !== "done").length;
  const totalActiveTasks = tasks.filter(t => t.status !== "done").length;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
    : 0;

  const pinnedAnnouncements = announcements.filter(a => a.isPinned === "yes").slice(0, 3);
  const upcomingDates = keyDates.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || "there"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your team today
          </p>
        </div>

        {/* Daily Focus */}
        <Card>
          <CardHeader>
            <CardTitle>What's your main focus today?</CardTitle>
            <CardDescription>
              Share your daily goal with the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g., Finish the wireframes, review team requests..."
                value={focusText}
                onChange={(e) => setFocusText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitFocus()}
                className="flex-1"
              />
              <Button onClick={handleSubmitFocus} disabled={!focusText.trim()}>
                Set Focus
              </Button>
            </div>
            
            {/* Team's Focus */}
            {todaysFocus.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Team Focus Today:</h4>
                {todaysFocus.map((focus) => (
                  <div key={focus.id} className="flex items-start gap-3 rounded-lg bg-accent/50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{focus.focusText}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {focus.userId === user?.id ? "You" : "Team member"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{urgentTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">High priority tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links & Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>📢 Announcements</CardTitle>
              <CardDescription>Important updates from the team</CardDescription>
            </CardHeader>
            <CardContent>
              {pinnedAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {pinnedAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`rounded-lg border p-3 ${
                        announcement.priority === "high"
                          ? "border-destructive bg-destructive/5"
                          : "border-border"
                      }`}
                    >
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No announcements</p>
              )}
            </CardContent>
          </Card>

          {/* Key Dates */}
          <Card>
            <CardHeader>
              <CardTitle>📅 Key Dates</CardTitle>
              <CardDescription>Upcoming milestones and events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDates.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDates.map((date) => (
                    <div key={date.id} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        {new Date(date.date).getDate()}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{date.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(date.date).toLocaleDateString()} • {date.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming dates</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Quick Links</CardTitle>
            <CardDescription>Access your tools and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://mail.google.com/chat/u/0/#chat/space/AAQAaqLmNgg" target="_blank" rel="noopener noreferrer">
                  💬 Google Chat
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://app.gohighlevel.com/v2/location/1FQsXgwXKmTlgXxr5ZA4/dashboard" target="_blank" rel="noopener noreferrer">
                  📊 Go High Level CRM
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://docs.google.com/spreadsheets/d/1MvIb2iBnX-9WVlq89D6HDzzvaLi4zswdnNML5NEJCL8/edit?gid=1895001918#gid=1895001918" target="_blank" rel="noopener noreferrer">
                  📈 Management Spreadsheet
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

