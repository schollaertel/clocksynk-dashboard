import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, MessageSquare } from "lucide-react";

export default function Chat() {
  const googleChatUrl = "https://mail.google.com/chat/u/0/#chat/space/AAQAaqLmNgg";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Chat</h1>
          <p className="text-muted-foreground mt-1">
            Connect with your team on Google Chat
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Google Chat Integration</CardTitle>
                <CardDescription>
                  Your team communication happens on Google Chat
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button below to open your team's Google Chat channel in a new tab. You can
              chat with your team members, share files, and collaborate in real-time.
            </p>
            
            <Button size="lg" asChild>
              <a href={googleChatUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-5 w-5" />
                Open Google Chat
              </a>
            </Button>

            <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6">
              <h3 className="font-semibold mb-3">Quick Tips for Team Chat:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use @mentions to get someone's attention quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Share files directly in the chat for easy collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use threads to keep conversations organized</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Set your status to let others know when you're available</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Additional Communication Tools */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Communication Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">For urgent matters:</strong> Use Google Chat with @mention
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">For updates:</strong> Post in Announcements section
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">For ideas:</strong> Submit through the Ideas Hub
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">For tasks:</strong> Create and assign in Tasks section
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time Expectations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Urgent messages:</strong> Within 1 hour during work hours
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Regular messages:</strong> Within 4 hours during work hours
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">After hours:</strong> Response by next business day
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Weekends:</strong> No response expected unless critical
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

