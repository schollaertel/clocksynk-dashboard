import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, CheckCircle2, Clock, Target, Lightbulb } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BoardView() {
  const { data: metrics, isLoading } = trpc.boardView.getMetrics.useQuery();
  const { data: recentActivity } = trpc.boardView.getRecentActivity.useQuery();

  if (isLoading) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading metrics...</p>
        </div>
      </TeamsLayout>
    );
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-400" : "text-red-400";
  };

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Board Member Dashboard</h1>
          <p className="text-gray-400 mt-2">
            High-level overview of ClockSynk's performance and progress
          </p>
          <Badge className="mt-3 bg-blue-600">View-Only Access</Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics?.taskCompletion || "0"}%
              </div>
              <div className={`flex items-center gap-1 text-sm mt-2 ${getTrendColor(metrics?.taskTrend || "down")}`}>
                {getTrendIcon(metrics?.taskTrend || "down")}
                <span>{metrics?.taskTrendValue || "0"}% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics?.activeProjects || "0"}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {metrics?.completedProjects || "0"} completed this month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${metrics?.revenue || "0"}
              </div>
              <div className={`flex items-center gap-1 text-sm mt-2 ${getTrendColor(metrics?.revenueTrend || "up")}`}>
                {getTrendIcon(metrics?.revenueTrend || "up")}
                <span>{metrics?.revenueTrendValue || "0"}% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Team Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {metrics?.teamHours || "0"}h
              </div>
              <div className="text-sm text-gray-400 mt-2">
                This week
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Financial Health
              </CardTitle>
              <CardDescription className="text-gray-400">
                Current financial status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Monthly Burn Rate</span>
                <span className="text-white font-semibold">${metrics?.burnRate || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Runway</span>
                <span className="text-white font-semibold">{metrics?.runway || "0"} months</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Revenue This Month</span>
                <span className="text-green-400 font-semibold">${metrics?.revenue || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Expenses This Month</span>
                <span className="text-orange-400 font-semibold">${metrics?.expenses || "0"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                Team Performance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Tasks Completed</span>
                <span className="text-white font-semibold">{metrics?.tasksCompleted || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Active Tasks</span>
                <span className="text-white font-semibold">{metrics?.activeTasks || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Overdue Tasks</span>
                <span className="text-orange-400 font-semibold">{metrics?.overdueTasks || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Ideas Submitted</span>
                <span className="text-white font-semibold">{metrics?.ideasSubmitted || "0"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">
              Latest updates and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity?.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <div className="mt-1">
                    {activity.type === "task" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                    {activity.type === "project" && <Target className="h-4 w-4 text-blue-400" />}
                    {activity.type === "idea" && <Lightbulb className="h-4 w-4 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notice */}
        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="py-4">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This is a view-only dashboard. For detailed access or questions, contact Erin at erin@clocksynk.com
            </p>
          </CardContent>
        </Card>
      </div>
    </TeamsLayout>
  );
}

