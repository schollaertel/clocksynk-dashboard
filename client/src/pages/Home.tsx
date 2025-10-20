import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: announcements = [] } = trpc.announcements.list.useQuery();
  const { data: keyDates = [] } = trpc.keyDates.list.useQuery();
  const { data: todaysFocus = [] } = trpc.dailyFocus.today.useQuery();

  // Calculate metrics
  const overdueTasks = tasks.filter(t => t.status === "overdue").length;
  const urgentTasks = tasks.filter(t => t.priority === "high" && t.status !== "done").length;
  const totalActiveTasks = tasks.filter(t => t.status !== "done").length;
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
    : 0;

  const recentTasks = tasks.slice(0, 5);
  const pinnedAnnouncements = announcements.filter(a => a.isPinned === "yes").slice(0, 3);
  const upcomingDates = keyDates.slice(0, 3);

  return (
    <TeamsLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Home</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your team workspace overview
          </p>
        </div>

        {/* Tabs - Teams Style */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="quick-links" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Quick Links
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Metrics Cards */}
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
                  <p className="text-xs text-muted-foreground mt-1">High priority</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActiveTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Done</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Latest team assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-3">
                      {recentTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                          <div className={`h-2 w-2 rounded-full mt-2 ${
                            task.status === "done" ? "bg-accent" :
                            task.status === "overdue" ? "bg-destructive" :
                            task.status === "in_progress" ? "bg-secondary" :
                            "bg-muted-foreground"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {task.assignedTo || "Unassigned"} • {task.status.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tasks yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Important updates</CardDescription>
                </CardHeader>
                <CardContent>
                  {pinnedAnnouncements.length > 0 ? (
                    <div className="space-y-3">
                      {pinnedAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="pb-3 border-b last:border-0">
                          <h4 className="text-sm font-medium">{announcement.title}</h4>
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
            </div>

            {/* Key Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Key Dates</CardTitle>
                <CardDescription>Important milestones and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDates.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {upcomingDates.map((date) => (
                      <div key={date.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {new Date(date.date).getDate()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{date.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(date.date).toLocaleDateString()}
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Focus Today</CardTitle>
                <CardDescription>What everyone is working on</CardDescription>
              </CardHeader>
              <CardContent>
                {todaysFocus.length > 0 ? (
                  <div className="space-y-3">
                    {todaysFocus.map((focus) => (
                      <div key={focus.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                        <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <p className="text-sm">{focus.focusText}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No focus entries today</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Links Tab */}
          <TabsContent value="quick-links" className="space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    💬 Google Chat
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://mail.google.com/chat/u/0/#chat/space/AAQAaqLmNgg" target="_blank" rel="noopener noreferrer">
                      Open Chat
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📊 Go High Level CRM
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://app.gohighlevel.com/v2/location/1FQsXgwXKmTlgXxr5ZA4/dashboard" target="_blank" rel="noopener noreferrer">
                      Open CRM
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📈 Management Sheet
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://docs.google.com/spreadsheets/d/1MvIb2iBnX-9WVlq89D6HDzzvaLi4zswdnNML5NEJCL8/edit" target="_blank" rel="noopener noreferrer">
                      Open Sheet
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TeamsLayout>
  );
}

