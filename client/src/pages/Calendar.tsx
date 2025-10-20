import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Calendar() {
  const { data: tasks = [] } = trpc.tasks.list.useQuery();
  const { data: keyDates = [] } = trpc.keyDates.list.useQuery();
  
  // Your Google Calendar embed URL
  // To get this: Go to Google Calendar > Settings > Your calendar > Integrate calendar > Copy iframe src
  const googleCalendarEmbedUrl = "https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=America/New_York";
  
  // Go High Level calendar URL
  const ghlCalendarUrl = "https://app.gohighlevel.com/v2/location/1FQsXgwXKmTlgXxr5ZA4/calendar";

  // Combine all events
  const allEvents = [
    ...tasks
      .filter(t => t.dueDate)
      .map(t => ({
        id: t.id,
        title: t.title,
        date: new Date(t.dueDate!),
        type: "task" as const,
        source: "Dashboard",
        assignedTo: t.assignedTo,
        priority: t.priority,
      })),
    ...keyDates.map(kd => ({
      id: kd.id,
      title: kd.title,
      date: new Date(kd.date),
      type: "milestone" as const,
      source: "Key Dates",
      priority: "medium" as const,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingEvents = allEvents.filter(e => e.date >= new Date());
  const todayEvents = allEvents.filter(e => {
    const today = new Date();
    return e.date.toDateString() === today.toDateString();
  });

  const getEventColor = (event: typeof allEvents[0]) => {
    if (event.type === "task") {
      if (event.priority === "high") return "border-l-4 border-l-destructive";
      if (event.priority === "medium") return "border-l-4 border-l-secondary";
      return "border-l-4 border-l-muted";
    }
    return "border-l-4 border-l-primary";
  };

  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" />
                Unified Calendar
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                All your events, tasks, and appointments in one place
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Google Calendar
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={ghlCalendarUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GHL Calendar
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Views */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Tabs defaultValue="unified" className="w-full">
            <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 w-full justify-start mb-6">
              <TabsTrigger 
                value="unified" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Unified View
              </TabsTrigger>
              <TabsTrigger 
                value="google" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Google Calendar
              </TabsTrigger>
              <TabsTrigger 
                value="ghl" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                GHL Calendar
              </TabsTrigger>
            </TabsList>

            {/* Unified View */}
            <TabsContent value="unified" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Today's Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Today</CardTitle>
                    <CardDescription>
                      {todayEvents.length} {todayEvents.length === 1 ? "event" : "events"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todayEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No events today</p>
                    ) : (
                      todayEvents.map((event) => (
                        <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event)}`}>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.source} • {event.type}
                          </p>
                          {'assignedTo' in event && event.assignedTo && (
                            <p className="text-xs text-muted-foreground">👤 {event.assignedTo}</p>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    <CardDescription>Next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    ) : (
                      upcomingEvents.slice(0, 20).map((event) => (
                        <div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event)} flex items-start justify-between`}>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.source} • {event.type}
                            </p>
                            {'assignedTo' in event && event.assignedTo && (
                              <p className="text-xs text-muted-foreground">👤 {event.assignedTo}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm font-medium">
                              {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.date.toLocaleDateString("en-US", { weekday: "short" })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Legend */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Event Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-destructive border rounded"></div>
                      <span>High Priority Tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-secondary border rounded"></div>
                      <span>Medium Priority Tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-l-4 border-l-primary border rounded"></div>
                      <span>Key Dates & Milestones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Google Calendar */}
            <TabsContent value="google" className="mt-0">
              <Card className="h-[700px]">
                <CardContent className="p-0 h-full">
                  <iframe
                    src={googleCalendarEmbedUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title="Google Calendar"
                  />
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>To embed your Google Calendar:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Google Calendar settings</li>
                    <li>Select your calendar from the left sidebar</li>
                    <li>Scroll to "Integrate calendar"</li>
                    <li>Copy the iframe src URL</li>
                    <li>Update the googleCalendarEmbedUrl in Calendar.tsx</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            {/* GHL Calendar */}
            <TabsContent value="ghl" className="mt-0">
              <Card className="h-[700px]">
                <CardContent className="p-0 h-full">
                  <iframe
                    src={ghlCalendarUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title="Go High Level Calendar"
                  />
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Go High Level Integration</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Your GHL calendar shows all appointments and bookings from your CRM. Click "Open in GHL" above to manage appointments directly.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TeamsLayout>
  );
}

