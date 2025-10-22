import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Sheets() {
  const { user } = useAuth();
  
  // Only Erin (admin) can access this page
  const isAdmin = user?.email === "erin@clocksynk.com";
  
  if (!isAdmin) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Access Denied</p>
            <p className="text-sm text-gray-500">Only administrators can access the management spreadsheet.</p>
          </div>
        </div>
      </TeamsLayout>
    );
  }
  // Your management spreadsheet ID
  const spreadsheetId = "1MvIb2iBnX-9WVlq89D6HDzzvaLi4zswdnNML5NEJCL8";
  const gid = "1895001918"; // The sheet tab ID from your URL
  
  // Construct embed URL
  const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}&rm=minimal&widget=true`;
  const fullUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=${gid}#gid=${gid}`;

  return (
    <TeamsLayout>
      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Management Spreadsheet</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your startup management data and tracking
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Sheets
              </a>
            </Button>
          </div>
        </div>

        {/* Embedded Spreadsheet */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <iframe
                src={embedUrl}
                className="w-full h-full min-h-[600px] border-0 rounded-lg"
                title="Management Spreadsheet"
                allowFullScreen
              />
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="p-6 pt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spreadsheet Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                <div>
                  <strong className="text-foreground">Edit directly:</strong> Changes sync automatically to Google Sheets
                </div>
                <div>
                  <strong className="text-foreground">Full access:</strong> Click "Open in Google Sheets" for advanced features
                </div>
                <div>
                  <strong className="text-foreground">Real-time:</strong> All team members see updates instantly
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeamsLayout>
  );
}

