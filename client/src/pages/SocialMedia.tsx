import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Share2, 
  Calendar, 
  Lightbulb, 
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  PlayCircle,
  TrendingUp,
  Plus,
  Send,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

export default function SocialMedia() {
  const { user } = useAuth();
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [showIdeaDialog, setShowIdeaDialog] = useState(false);

  // Fetch campaigns from Google Drive
  const { data: campaigns } = trpc.socialMedia.listCampaigns.useQuery();
  const { data: contentCalendar } = trpc.socialMedia.getContentCalendar.useQuery();
  const { data: contentIdeas } = trpc.socialMedia.listContentIdeas.useQuery();

  const submitIdeaMutation = trpc.socialMedia.submitContentIdea.useMutation({
    onSuccess: () => {
      toast.success("Content idea submitted for review!");
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      setShowIdeaDialog(false);
    },
    onError: () => {
      toast.error("Failed to submit content idea");
    },
  });

  const handleSubmitIdea = () => {
    if (!newIdeaTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    submitIdeaMutation.mutate({
      title: newIdeaTitle,
      description: newIdeaDescription,
    });
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-600";
      case "scheduled":
        return "bg-blue-600";
      case "completed":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCampaignStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <PlayCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  // Google Drive folder URL
  const DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1tSi-rTW1mqrZvmJjUK4NG_x3SyEZpeoV";

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Social Media Campaigns</h1>
            <p className="text-gray-400 mt-2">
              Manage campaigns, content calendar, and ideas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(DRIVE_FOLDER_URL, "_blank")}
              className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Drive Folder
            </Button>
            <Dialog open={showIdeaDialog} onOpenChange={setShowIdeaDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Submit Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Submit Content Idea</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Share your content ideas for review and approval
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Title</label>
                    <Input
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      placeholder="e.g., Tournament Highlight Reel"
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Description</label>
                    <Textarea
                      value={newIdeaDescription}
                      onChange={(e) => setNewIdeaDescription(e.target.value)}
                      placeholder="Describe your content idea..."
                      rows={4}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitIdea}
                    disabled={submitIdeaMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitIdeaMutation.isPending ? "Submitting..." : "Submit Idea"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium">Campaign Management via Google Drive</p>
                <p className="text-sm text-blue-200 mt-1">
                  Each campaign has its own folder in Google Drive with a planning sheet and assets. 
                  Use Go High Level for actual posting and scheduling.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Cards */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Active Campaigns</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign: any) => (
                <Card key={campaign.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCampaignStatusIcon(campaign.status)}
                        <CardTitle className="text-white text-lg">{campaign.name}</CardTitle>
                      </div>
                      <Badge className={getCampaignStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400 mt-2">
                      {campaign.description || "Campaign planning and content"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-gray-400 text-xs">Posts</p>
                        <p className="text-white font-semibold">{campaign.postsCount || 0}</p>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded">
                        <p className="text-gray-400 text-xs">Assets</p>
                        <p className="text-white font-semibold">{campaign.assetsCount || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(campaign.folderUrl, "_blank")}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Folder
                      </Button>
                      {campaign.sheetUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(campaign.sheetUrl, "_blank")}
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Sheet
                        </Button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => toast.info("Open Go High Level to schedule posts")}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Schedule in GHL
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-gray-800/50 border-gray-700 col-span-full">
                <CardContent className="py-12 text-center">
                  <FolderOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No campaigns found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create campaign folders in Google Drive to get started
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => window.open(DRIVE_FOLDER_URL, "_blank")}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Drive Folder
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Content Calendar */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Content Calendar
            </CardTitle>
            <CardDescription className="text-gray-400">
              Upcoming scheduled posts across all campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentCalendar && contentCalendar.length > 0 ? (
              <div className="space-y-3">
                {contentCalendar.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex-shrink-0 w-16 text-center">
                      <p className="text-2xl font-bold text-white">
                        {new Date(item.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{item.campaign}</p>
                    </div>
                    <Badge className="bg-purple-600">{item.platform}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No scheduled posts</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add content to your campaign sheets to see them here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Ideas */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Content Ideas
            </CardTitle>
            <CardDescription className="text-gray-400">
              Team submissions pending review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentIdeas && contentIdeas.length > 0 ? (
              <div className="space-y-3">
                {contentIdeas.map((idea: any) => (
                  <div key={idea.id} className="p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{idea.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{idea.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted by {idea.submittedBy} • {new Date(idea.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={
                          idea.status === "approved" ? "bg-green-600" :
                          idea.status === "rejected" ? "bg-red-600" :
                          "bg-yellow-600"
                        }
                      >
                        {idea.status}
                      </Badge>
                    </div>
                    {user?.email === "erin@clocksynk.com" && idea.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No content ideas yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Submit your creative ideas for social media content
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Stats (Placeholder) */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">24</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">+12%</div>
              <p className="text-xs text-gray-500 mt-1">vs last month</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">8.5K</div>
              <p className="text-xs text-gray-500 mt-1">Total impressions</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{campaigns?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active campaigns</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeamsLayout>
  );
}

