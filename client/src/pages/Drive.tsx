import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink } from "lucide-react";

export default function Drive() {
  // You can customize this to your team's shared drive folder
  const driveUrl = "https://drive.google.com/drive/";
  
  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                Google Drive
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Access team files and documents
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href={driveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Drive
              </a>
            </Button>
          </div>
        </div>

        {/* Embedded Drive */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <iframe
                src={driveUrl}
                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                title="Google Drive"
                allowFullScreen
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="p-6 pt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Access</CardTitle>
              <CardDescription>Common folders and files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button variant="outline" className="justify-start" asChild>
                  <a href={driveUrl + "my-drive"} target="_blank" rel="noopener noreferrer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Drive
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href={driveUrl + "shared-with-me"} target="_blank" rel="noopener noreferrer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Shared with Me
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href={driveUrl + "recent"} target="_blank" rel="noopener noreferrer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Recent
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeamsLayout>
  );
}

