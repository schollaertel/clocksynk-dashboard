import TeamsLayout from "@/components/TeamsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  FileIcon, 
  FolderIcon, 
  Search, 
  ExternalLink,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
} from "lucide-react";
import { useState } from "react";

export default function Drive() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: connectionStatus } = trpc.google.isConnected.useQuery();
  const { data: files = [], isLoading } = trpc.google.drive.list.useQuery(
    { query: searchQuery || undefined },
    { enabled: connectionStatus?.connected }
  );

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google/login";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("folder")) return <FolderIcon className="h-8 w-8 text-yellow-500" />;
    if (mimeType.includes("document")) return <FileText className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes("spreadsheet")) return <FileIcon className="h-8 w-8 text-green-500" />;
    if (mimeType.includes("presentation")) return <FileIcon className="h-8 w-8 text-orange-500" />;
    if (mimeType.includes("image")) return <ImageIcon className="h-8 w-8 text-purple-500" />;
    if (mimeType.includes("video")) return <Video className="h-8 w-8 text-red-500" />;
    if (mimeType.includes("audio")) return <Music className="h-8 w-8 text-pink-500" />;
    if (mimeType.includes("zip") || mimeType.includes("archive")) return <Archive className="h-8 w-8 text-gray-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  };

  if (!connectionStatus?.connected) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>Connect Google Drive</CardTitle>
              <CardDescription>
                Connect your Google account to access your Drive files directly in the dashboard
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <FolderIcon className="h-6 w-6" />
                Google Drive
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {connectionStatus?.email && `Connected as ${connectionStatus.email}`}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in Google Drive
              </a>
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Files List */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "No files found matching your search" : "No files found"}
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file: any) => (
                <Card key={file.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {file.thumbnailLink ? (
                          <img 
                            src={file.thumbnailLink} 
                            alt={file.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          getFileIcon(file.mimeType || "")
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>Modified {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeamsLayout>
  );
}

