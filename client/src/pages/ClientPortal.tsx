import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { Calendar, DollarSign, MessageSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ClientPortal() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  
  // In a real implementation, we'd get the client ID from the logged-in user
  // For now, we'll use a placeholder
  const { data: projects, isLoading } = trpc.clientPortal.getProjects.useQuery();
  const { data: updates } = trpc.clientPortal.getUpdates.useQuery();
  const sendMessageMutation = trpc.clientPortal.sendMessage.useMutation();

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({ message });
      toast.success("Message sent!");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-600";
      case "in_progress": return "bg-blue-600";
      case "review": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "review": return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading your projects...</p>
        </div>
      </TeamsLayout>
    );
  }

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Client Portal</h1>
          <p className="text-gray-400 mt-2">
            Track your project progress and communicate with the ClockSynk team
          </p>
        </div>

        {/* Projects */}
        <div className="grid gap-6 md:grid-cols-2">
          {projects?.map((project: any) => (
            <Card key={project.id} className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{project.projectName}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {project.description}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      {project.status.replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.startDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span>Budget: {project.budget}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(!projects || projects.length === 0) && (
            <Card className="bg-gray-800/50 border-gray-700 md:col-span-2">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">No active projects</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Communication */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Project Updates & Messages
            </CardTitle>
            <CardDescription className="text-gray-400">
              Stay in touch with your project team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recent Updates */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {updates?.map((update: any) => (
                <div key={update.id} className="p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{update.author}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">{update.message}</p>
                </div>
              ))}
              {(!updates || updates.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
              )}
            </div>

            {/* Send Message */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <Textarea
                placeholder="Send a message to the ClockSynk team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={handleSendMessage}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={sendMessageMutation.isPending}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamsLayout>
  );
}

