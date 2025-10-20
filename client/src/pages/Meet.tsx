import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, ExternalLink, Plus } from "lucide-react";
import { useState } from "react";

export default function Meet() {
  const [meetingCode, setMeetingCode] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");

  const handleJoinMeeting = () => {
    if (!meetingCode.trim()) return;
    
    // Clean up the meeting code (remove spaces, convert to lowercase)
    const cleanCode = meetingCode.trim().toLowerCase().replace(/\s+/g, "-");
    
    // Create embed URL
    const url = `https://meet.google.com/${cleanCode}`;
    setEmbedUrl(url);
  };

  const handleNewMeeting = () => {
    // Open Google Meet in new tab to create a new meeting
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Video className="h-6 w-6" />
                Google Meet
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Video meetings and collaboration
              </p>
            </div>
            <Button onClick={handleNewMeeting}>
              <Plus className="mr-2 h-4 w-4" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Join Meeting Section */}
        {!embedUrl && (
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Join a Meeting</CardTitle>
                <CardDescription>Enter a meeting code or link to join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="meetingCode" className="sr-only">Meeting Code</Label>
                    <Input
                      id="meetingCode"
                      placeholder="Enter meeting code (e.g., abc-defg-hij)"
                      value={meetingCode}
                      onChange={(e) => setMeetingCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                    />
                  </div>
                  <Button onClick={handleJoinMeeting} disabled={!meetingCode.trim()}>
                    Join Meeting
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button variant="outline" onClick={handleNewMeeting} className="justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Start New Meeting
                    </Button>
                    <Button variant="outline" asChild className="justify-start">
                      <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Google Meet
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meeting Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Meeting Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Test your camera and microphone before important meetings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Use headphones to prevent echo and improve audio quality</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Mute yourself when not speaking to reduce background noise</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Share your screen to collaborate on documents and presentations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Record important meetings for team members who can't attend</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Embedded Meeting */}
        {embedUrl && (
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meeting in Progress</CardTitle>
                  <CardDescription>Meeting Code: {meetingCode}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open in New Tab
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEmbedUrl(""); setMeetingCode(""); }}>
                    Leave Meeting
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                <iframe
                  src={embedUrl}
                  className="w-full h-full min-h-[600px] border-0 rounded-b-lg"
                  title="Google Meet"
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TeamsLayout>
  );
}

