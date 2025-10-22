import TeamsLayout from "@/components/TeamsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

export default function Budget() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  // Fetch financial metrics from QuickBooks
  const { data: qbStatus, refetch: refetchQB } = trpc.quickbooks.getStatus.useQuery();
  const { data: financialMetrics } = trpc.quickbooks.getFinancialMetrics.useQuery();
  const { data: projectBudgets } = trpc.budget.listProjectBudgets.useQuery();

  const handleSyncQuickBooks = async () => {
    setSyncing(true);
    try {
      await refetchQB();
      toast.success("QuickBooks data synced!");
    } catch (error) {
      toast.error("Failed to sync QuickBooks");
    } finally {
      setSyncing(false);
    }
  };

  // Check if user has permission to view financials
  const isAdmin = user?.email === "erin@clocksynk.com";
  const canViewFinancials = isAdmin; // Only admin can see all financials

  if (!canViewFinancials) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Access Denied</p>
            <p className="text-sm text-gray-500">Only administrators can access budget and financial data.</p>
          </div>
        </div>
      </TeamsLayout>
    );
  }

  const metrics = financialMetrics || {
    revenue: 0,
    expenses: 0,
    profit: 0,
    burnRate: 0,
    runway: 0,
    cash: 0,
  };

  const profitMargin = metrics.revenue > 0 
    ? ((metrics.profit / metrics.revenue) * 100).toFixed(1) 
    : "0.0";

  const isQBConfigured = qbStatus?.configured || false;

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budget & Financials</h1>
            <p className="text-gray-400 mt-2">
              Track revenue, expenses, and project budgets
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isQBConfigured && (
              <Button
                onClick={handleSyncQuickBooks}
                disabled={syncing}
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/10"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {syncing ? "Syncing..." : "Sync QuickBooks"}
              </Button>
            )}
          </div>
        </div>

        {/* QuickBooks Status */}
        {!isQBConfigured && (
          <Card className="bg-orange-900/20 border-orange-700/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-orange-300 font-medium">QuickBooks Not Connected</p>
                  <p className="text-sm text-orange-200 mt-1">
                    Connect QuickBooks to automatically sync financial data. Financial metrics below are placeholder values.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 border-orange-600 text-orange-400 hover:bg-orange-600/10"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure QuickBooks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Financial Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                ${metrics.revenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2 text-green-400">
                <ArrowUpRight className="h-4 w-4" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-orange-400" />
                Monthly Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                ${metrics.expenses.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm mt-2 text-orange-400">
                <ArrowDownRight className="h-4 w-4" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${metrics.profit.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {profitMargin}% margin
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                Runway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrics.runway < 6 ? 'text-red-400' : 'text-white'}`}>
                {metrics.runway} mo
              </div>
              <div className="text-sm text-gray-400 mt-2">
                At current burn rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Health Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-400" />
                Cash Flow
              </CardTitle>
              <CardDescription className="text-gray-400">
                Current financial position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Cash on Hand</span>
                <span className="text-white font-semibold">${metrics.cash?.toLocaleString() || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Monthly Burn Rate</span>
                <span className="text-orange-400 font-semibold">${metrics.burnRate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Revenue This Month</span>
                <span className="text-green-400 font-semibold">${metrics.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-400">Expenses This Month</span>
                <span className="text-orange-400 font-semibold">${metrics.expenses.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Financial Health Score
              </CardTitle>
              <CardDescription className="text-gray-400">
                Overall business health indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Profitability</span>
                  <span className="text-sm text-white font-semibold">{profitMargin}%</span>
                </div>
                <Progress value={Math.min(parseFloat(profitMargin), 100)} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Runway Health</span>
                  <span className="text-sm text-white font-semibold">
                    {metrics.runway >= 12 ? "Excellent" : metrics.runway >= 6 ? "Good" : "Critical"}
                  </span>
                </div>
                <Progress 
                  value={Math.min((metrics.runway / 12) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Cash Reserve</span>
                  <span className="text-sm text-white font-semibold">
                    ${metrics.cash?.toLocaleString() || "0"}
                  </span>
                </div>
                <Progress 
                  value={metrics.cash && metrics.burnRate ? Math.min((metrics.cash / (metrics.burnRate * 12)) * 100, 100) : 0} 
                  className="h-2"
                />
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  {metrics.profit >= 0 && metrics.runway >= 6 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Healthy Financial Position</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                      <span className="text-sm text-orange-400 font-medium">Monitor Cash Flow Closely</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Budgets */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-400" />
              Project Budgets
            </CardTitle>
            <CardDescription className="text-gray-400">
              Budget vs actual spending by project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectBudgets && projectBudgets.length > 0 ? (
              <div className="space-y-4">
                {projectBudgets.map((project: any) => {
                  const percentUsed = project.budget > 0 
                    ? (project.spent / project.budget) * 100 
                    : 0;
                  const isOverBudget = percentUsed > 100;

                  return (
                    <div key={project.id} className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-400">{project.client}</p>
                        </div>
                        <Badge 
                          className={isOverBudget ? "bg-red-600" : "bg-green-600"}
                        >
                          {percentUsed.toFixed(0)}% used
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-400">Budget</p>
                          <p className="text-white font-semibold">${project.budget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Spent</p>
                          <p className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                            ${project.spent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Remaining</p>
                          <p className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                            ${(project.budget - project.spent).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentUsed, 100)} 
                        className="h-2 mt-3"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No project budgets configured</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Add Project Budget
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QuickBooks Info */}
        {isQBConfigured && (
          <Card className="bg-blue-900/20 border-blue-700/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-medium">QuickBooks Connected</p>
                  <p className="text-sm text-blue-200 mt-1">
                    Financial data is automatically synced from QuickBooks Online. Last synced: Just now
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TeamsLayout>
  );
}

