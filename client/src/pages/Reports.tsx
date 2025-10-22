import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Calendar, TrendingUp, Download, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Reports() {
  const { user } = useAuth();
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [generatingMonthly, setGeneratingMonthly] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  const generateWeeklyMutation = trpc.reporting.generateWeeklyReport.useQuery(
    undefined,
    { enabled: false }
  );

  const generateMonthlyMutation = trpc.reporting.generateMonthlyReport.useQuery(
    undefined,
    { enabled: false }
  );

  const sendWeeklyMutation = trpc.reporting.sendWeeklyReport.useMutation({
    onSuccess: () => {
      toast.success("Weekly report sent to team!");
    },
    onError: () => {
      toast.error("Failed to send weekly report");
    },
  });

  const sendMonthlyMutation = trpc.reporting.sendMonthlyReport.useMutation({
    onSuccess: () => {
      toast.success("Monthly report sent!");
    },
    onError: () => {
      toast.error("Failed to send monthly report");
    },
  });

  const handleGenerateWeekly = async () => {
    setGeneratingWeekly(true);
    try {
      const result = await generateWeeklyMutation.refetch();
      setWeeklyReport(result.data);
      toast.success("Weekly report generated!");
    } catch (error) {
      toast.error("Failed to generate weekly report");
    } finally {
      setGeneratingWeekly(false);
    }
  };

  const handleGenerateMonthly = async () => {
    setGeneratingMonthly(true);
    try {
      const result = await generateMonthlyMutation.refetch();
      setMonthlyReport(result.data);
      toast.success("Monthly report generated!");
    } catch (error) {
      toast.error("Failed to generate monthly report");
    } finally {
      setGeneratingMonthly(false);
    }
  };

  const handleSendWeekly = () => {
    sendWeeklyMutation.mutate();
  };

  const handleSendMonthly = () => {
    sendMonthlyMutation.mutate();
  };

  // Only admin (Erin) can access this page
  const isAdmin = user?.email === "erin@clocksynk.com";

  if (!isAdmin) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Access Denied</p>
            <p className="text-sm text-gray-500">Only administrators can access reports.</p>
          </div>
        </div>
      </TeamsLayout>
    );
  }

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Automated Reports</h1>
          <p className="text-gray-400 mt-2">
            Generate and send weekly and monthly reports to the team
          </p>
        </div>

        {/* Report Schedule Info */}
        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 font-medium">Automated Schedule</p>
                <p className="text-sm text-blue-200 mt-1">
                  <strong>Weekly Reports:</strong> Every Monday at 9:00 AM → Erin, Jared, Bill (info@clocksynk.com)
                </p>
                <p className="text-sm text-blue-200 mt-1">
                  <strong>Monthly Reports:</strong> 1st of each month at 9:00 AM → Erin + Board Member
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Report */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-400" />
              Weekly Team Report
            </CardTitle>
            <CardDescription className="text-gray-400">
              Team performance and activity summary for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateWeekly}
                disabled={generatingWeekly}
                className="bg-green-600 hover:bg-green-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {generatingWeekly ? "Generating..." : "Generate Preview"}
              </Button>
              <Button
                onClick={handleSendWeekly}
                disabled={sendWeeklyMutation.isPending}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/10"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendWeeklyMutation.isPending ? "Sending..." : "Send Now"}
              </Button>
            </div>

            {weeklyReport && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{weeklyReport.title}</h3>
                  <Badge className="bg-green-600">{weeklyReport.period}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Task Completion</p>
                    <p className="text-2xl font-bold text-white">{weeklyReport.metrics.taskCompletion}%</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Tasks Completed</p>
                    <p className="text-2xl font-bold text-white">{weeklyReport.metrics.tasksCompleted}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Active Tasks</p>
                    <p className="text-2xl font-bold text-white">{weeklyReport.metrics.activeTasks}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Hours Logged</p>
                    <p className="text-2xl font-bold text-white">{weeklyReport.teamActivity.totalHoursLogged.toFixed(1)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Recent Highlights:</p>
                  <div className="space-y-2">
                    {weeklyReport.highlights.slice(0, 3).map((activity: any, index: number) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        <span>{activity.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Report */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Monthly Business Report
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive business metrics and financial overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateMonthly}
                disabled={generatingMonthly}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {generatingMonthly ? "Generating..." : "Generate Preview"}
              </Button>
              <Button
                onClick={handleSendMonthly}
                disabled={sendMonthlyMutation.isPending}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMonthlyMutation.isPending ? "Sending..." : "Send Now"}
              </Button>
            </div>

            {monthlyReport && (
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{monthlyReport.title}</h3>
                  <Badge className="bg-blue-600">{monthlyReport.period}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Task Completion</p>
                    <p className="text-2xl font-bold text-white">{monthlyReport.executiveSummary.taskCompletion}%</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Active Projects</p>
                    <p className="text-2xl font-bold text-white">{monthlyReport.executiveSummary.activeProjects}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-green-400">${monthlyReport.executiveSummary.revenue}</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-xs text-gray-400">Runway</p>
                    <p className="text-2xl font-bold text-white">{monthlyReport.executiveSummary.runway} mo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-sm text-gray-400 mb-2">Team Performance</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tasks Completed:</span>
                        <span className="text-white font-semibold">{monthlyReport.teamPerformance.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Hours Logged:</span>
                        <span className="text-white font-semibold">{monthlyReport.teamPerformance.totalHoursLogged.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ideas Submitted:</span>
                        <span className="text-white font-semibold">{monthlyReport.teamPerformance.ideasSubmitted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded">
                    <p className="text-sm text-gray-400 mb-2">Financial Health</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Revenue:</span>
                        <span className="text-green-400 font-semibold">${monthlyReport.executiveSummary.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Expenses:</span>
                        <span className="text-orange-400 font-semibold">${monthlyReport.executiveSummary.expenses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Burn Rate:</span>
                        <span className="text-white font-semibold">${monthlyReport.executiveSummary.burnRate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipients Info */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              Report Recipients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="text-gray-300">Weekly Report</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-green-600 text-green-400">Erin</Badge>
                <Badge variant="outline" className="border-green-600 text-green-400">Jared</Badge>
                <Badge variant="outline" className="border-green-600 text-green-400">Bill</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="text-gray-300">Monthly Report</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-blue-600 text-blue-400">Erin</Badge>
                <Badge variant="outline" className="border-blue-600 text-blue-400">Board Member</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamsLayout>
  );
}

