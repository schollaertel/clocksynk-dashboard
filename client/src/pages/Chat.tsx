import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

export default function Chat() {
  const googleChatUrl = "https://mail.google.com/chat/u/0/#chat/space/AAQAaqLmNgg";
  
  // Embed URL for Google Chat (note: Google Chat has limited embed support)
  const embedUrl = googleChatUrl;

  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Team Chat
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Communicate with your team in real-time
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href={googleChatUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Chat
              </a>
            </Button>
          </div>
        </div>

        {/* Embedded Chat */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <iframe
                src={embedUrl}
                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                title="Google Chat"
                allowFullScreen
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Guidelines */}
        <div className="p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communication Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Urgent matters:</strong> Use @mention to notify team members
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">File sharing:</strong> Drag and drop files directly into chat
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Threads:</strong> Use threads to keep conversations organized
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Status:</strong> Set your status to show availability
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Expectations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Urgent:</strong> Within 1 hour during work hours
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Regular:</strong> Within 4 hours during work hours
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">After hours:</strong> Next business day
                </div>
                <div className="text-muted-foreground">
                  <strong className="text-foreground">Weekends:</strong> No response expected unless critical
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TeamsLayout>
  );
}

