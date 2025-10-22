import TeamsLayout from "@/components/TeamsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { MessageSquare, ExternalLink, Users, Clock } from "lucide-react";

export default function Chat() {
  const { data: connectionStatus } = trpc.google.isConnected.useQuery();

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google/login";
  };

  // Your Google Chat space URL
  const chatSpaceUrl = "https://mail.google.com/chat/u/0/#chat/space/AAQAaqLmNgg";

  if (!connectionStatus?.connected) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>Connect Google Chat</CardTitle>
              <CardDescription>
                Connect your Google account to access team conversations directly in the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleConnectGoogle} className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect with Google
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                You'll be redirected to Google to authorize access
              </p>
            </CardContent>
          </Card>
        </div>
      </TeamsLayout>
    );
  }

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
                {connectionStatus?.email && `Connected as ${connectionStatus.email}`}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={chatSpaceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Chat
              </a>
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid gap-6 max-w-4xl mx-auto">
            {/* Communication Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Communication Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Response Times</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Urgent:</strong> Within 1 hour during work hours</li>
                    <li>• <strong>Normal:</strong> Within 4 hours during work hours</li>
                    <li>• <strong>Low priority:</strong> Within 24 hours</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Best Practices</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Use @mentions for urgent items</li>
                    <li>• Keep messages clear and concise</li>
                    <li>• Use threads for detailed discussions</li>
                    <li>• Share files directly in chat when possible</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Working Hours</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Erin:</strong> 7 AM - 3 PM (Teaching schedule)</li>
                    <li>• <strong>Team:</strong> Flexible, update in daily check-in</li>
                    <li>• Respect each other's off-hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={chatSpaceUrl} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Team Chat Space
                  </a>
                </Button>
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="https://mail.google.com/chat/u/0/" target="_blank" rel="noopener noreferrer">
                    <Users className="mr-2 h-4 w-4" />
                    View All Conversations
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Embedded Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Chat Space</CardTitle>
                <CardDescription>
                  Your main team communication channel
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-[16/10] bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={chatSpaceUrl}
                    className="w-full h-full border-0"
                    title="Google Chat"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                </div>
                <div className="p-4 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    If the chat doesn't load above, click "Open in Google Chat" to access it in a new tab.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chat Tips for Team */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Effective Team Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">For Limited Tech Skills:</h4>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Click "Open in Google Chat" button for easier access</li>
                      <li>• Type your message and press Enter to send</li>
                      <li>• Click the paperclip icon to attach files</li>
                      <li>• Use emoji reactions to acknowledge messages quickly</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">For Creative Team Members:</h4>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Share ideas immediately when they come to you</li>
                      <li>• Use images and screenshots to communicate visually</li>
                      <li>• Don't worry about perfect formatting - just share!</li>
                      <li>• Ask questions anytime - the team is here to help</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">For Erin (Admin):</h4>
                    <ul className="text-muted-foreground space-y-1 ml-4">
                      <li>• Check chat during breaks between classes</li>
                      <li>• Set expectations for response times</li>
                      <li>• Use starred messages for important items</li>
                      <li>• Create separate threads for different topics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TeamsLayout>
  );
}

