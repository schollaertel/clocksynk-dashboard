import { getBoardMetrics, getRecentActivity, getTasks, getAllTimeEntries, getAllClientProjects } from "./db";
import { invokeLLM } from "./_core/llm";

/**
 * Generate a weekly report with team performance metrics
 */
export async function generateWeeklyReport() {
  try {
    const metrics = await getBoardMetrics();
    const recentActivity = await getRecentActivity();
    const tasks = await getTasks();
    const timeEntries = await getAllTimeEntries();

    // Calculate week-specific metrics
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekTasks = tasks.filter((t: any) => {
      const createdAt = new Date(t.createdAt);
      return createdAt >= weekStart;
    });
    
    const weekTimeEntries = timeEntries.filter((e: any) => {
      const date = new Date(e.date);
      return date >= weekStart;
    });

    // Build report content
    const report = {
      title: "ClockSynk Weekly Team Report",
      period: `Week of ${weekStart.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      metrics: {
        taskCompletion: metrics?.taskCompletion || 0,
        tasksCompleted: metrics?.tasksCompleted || 0,
        activeTasks: metrics?.activeTasks || 0,
        overdueTasks: metrics?.overdueTasks || 0,
        teamHours: metrics?.teamHours || 0,
        newTasksThisWeek: weekTasks.length,
      },
      highlights: recentActivity?.slice(0, 5) || [],
      teamActivity: {
        totalHoursLogged: weekTimeEntries.reduce((sum: number, entry: any) => {
          const hours = parseFloat(entry.totalHours || "0");
          return sum + hours;
        }, 0),
        entriesCount: weekTimeEntries.length,
      },
    };

    return report;
  } catch (error) {
    console.error("[Reporting] Error generating weekly report:", error);
    throw error;
  }
}

/**
 * Generate a monthly report with comprehensive business metrics
 */
export async function generateMonthlyReport() {
  try {
    const metrics = await getBoardMetrics();
    const recentActivity = await getRecentActivity();
    const tasks = await getTasks();
    const timeEntries = await getAllTimeEntries();
    const projects = await getAllClientProjects();

    // Calculate month-specific metrics
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const monthTasks = tasks.filter((t: any) => {
      const createdAt = new Date(t.createdAt);
      return createdAt >= monthStart;
    });
    
    const monthTimeEntries = timeEntries.filter((e: any) => {
      const date = new Date(e.date);
      return date >= monthStart;
    });

    const activeProjects = projects.filter((p: any) => 
      p.status === "in_progress" || p.status === "planning"
    );

    const completedProjects = projects.filter((p: any) => {
      const updatedAt = new Date(p.updatedAt);
      return p.status === "completed" && updatedAt >= monthStart;
    });

    // Build comprehensive monthly report
    const report = {
      title: "ClockSynk Monthly Business Report",
      period: `${monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      executiveSummary: {
        taskCompletion: metrics?.taskCompletion || 0,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        revenue: metrics?.revenue || 0,
        expenses: metrics?.expenses || 0,
        burnRate: metrics?.burnRate || 0,
        runway: metrics?.runway || 0,
      },
      teamPerformance: {
        tasksCompleted: metrics?.tasksCompleted || 0,
        activeTasks: metrics?.activeTasks || 0,
        overdueTasks: metrics?.overdueTasks || 0,
        newTasksThisMonth: monthTasks.length,
        totalHoursLogged: monthTimeEntries.reduce((sum: number, entry: any) => {
          const hours = parseFloat(entry.totalHours || "0");
          return sum + hours;
        }, 0),
        ideasSubmitted: metrics?.ideasSubmitted || 0,
      },
      projectStatus: {
        active: activeProjects.map((p: any) => ({
          name: p.projectName,
          client: p.clientName,
          status: p.status,
          dueDate: p.dueDate,
        })),
        completed: completedProjects.map((p: any) => ({
          name: p.projectName,
          client: p.clientName,
          completedDate: p.updatedAt,
        })),
      },
      recentMilestones: recentActivity?.slice(0, 10) || [],
    };

    return report;
  } catch (error) {
    console.error("[Reporting] Error generating monthly report:", error);
    throw error;
  }
}

/**
 * Format report as HTML email
 */
export function formatReportAsHTML(report: any, isMonthly: boolean = false): string {
  const brandColors = {
    deepBlue: "#1e3a8a",
    brightGreen: "#10b981",
    electricBlue: "#3b82f6",
    energeticOrange: "#f97316",
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, ${brandColors.deepBlue} 0%, ${brandColors.electricBlue} 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric-card { background-color: #f9fafb; border-left: 4px solid ${brandColors.brightGreen}; padding: 15px; border-radius: 4px; }
    .metric-card.warning { border-left-color: ${brandColors.energeticOrange}; }
    .metric-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
    .metric-card .value { font-size: 32px; font-weight: bold; color: #111827; }
    .section { margin: 30px 0; }
    .section h2 { color: ${brandColors.deepBlue}; border-bottom: 2px solid ${brandColors.brightGreen}; padding-bottom: 10px; }
    .activity-item { background-color: #f9fafb; padding: 12px; margin: 8px 0; border-radius: 4px; border-left: 3px solid ${brandColors.electricBlue}; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background-color: ${brandColors.deepBlue}; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    tr:hover { background-color: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${report.title}</h1>
      <p>${report.period}</p>
    </div>
    <div class="content">
  `;

  if (isMonthly) {
    // Monthly report - executive summary
    html += `
      <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <h3>Task Completion</h3>
            <div class="value">${report.executiveSummary.taskCompletion}%</div>
          </div>
          <div class="metric-card">
            <h3>Active Projects</h3>
            <div class="value">${report.executiveSummary.activeProjects}</div>
          </div>
          <div class="metric-card">
            <h3>Revenue</h3>
            <div class="value">$${report.executiveSummary.revenue}</div>
          </div>
          <div class="metric-card ${report.executiveSummary.runway < 6 ? 'warning' : ''}">
            <h3>Runway</h3>
            <div class="value">${report.executiveSummary.runway} mo</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Financial Health</h2>
        <table>
          <tr>
            <td><strong>Monthly Revenue</strong></td>
            <td style="color: ${brandColors.brightGreen};">$${report.executiveSummary.revenue}</td>
          </tr>
          <tr>
            <td><strong>Monthly Expenses</strong></td>
            <td style="color: ${brandColors.energeticOrange};">$${report.executiveSummary.expenses}</td>
          </tr>
          <tr>
            <td><strong>Burn Rate</strong></td>
            <td>$${report.executiveSummary.burnRate}/month</td>
          </tr>
          <tr>
            <td><strong>Runway</strong></td>
            <td>${report.executiveSummary.runway} months</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Team Performance</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <h3>Tasks Completed</h3>
            <div class="value">${report.teamPerformance.tasksCompleted}</div>
          </div>
          <div class="metric-card ${report.teamPerformance.overdueTasks > 0 ? 'warning' : ''}">
            <h3>Overdue Tasks</h3>
            <div class="value">${report.teamPerformance.overdueTasks}</div>
          </div>
          <div class="metric-card">
            <h3>Hours Logged</h3>
            <div class="value">${report.teamPerformance.totalHoursLogged.toFixed(1)}</div>
          </div>
          <div class="metric-card">
            <h3>Ideas Submitted</h3>
            <div class="value">${report.teamPerformance.ideasSubmitted}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Project Status</h2>
        <h3 style="color: ${brandColors.electricBlue}; margin-top: 20px;">Active Projects (${report.projectStatus.active.length})</h3>
        ${report.projectStatus.active.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${report.projectStatus.active.map((p: any) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.client}</td>
                  <td>${p.status}</td>
                  <td>${p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'TBD'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No active projects</p>'}

        <h3 style="color: ${brandColors.brightGreen}; margin-top: 20px;">Completed This Month (${report.projectStatus.completed.length})</h3>
        ${report.projectStatus.completed.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              ${report.projectStatus.completed.map((p: any) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.client}</td>
                  <td>${new Date(p.completedDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p>No projects completed this month</p>'}
      </div>
    `;
  } else {
    // Weekly report - team focus
    html += `
      <div class="section">
        <h2>This Week's Performance</h2>
        <div class="metric-grid">
          <div class="metric-card">
            <h3>Task Completion</h3>
            <div class="value">${report.metrics.taskCompletion}%</div>
          </div>
          <div class="metric-card">
            <h3>Tasks Completed</h3>
            <div class="value">${report.metrics.tasksCompleted}</div>
          </div>
          <div class="metric-card ${report.metrics.overdueTasks > 0 ? 'warning' : ''}">
            <h3>Overdue Tasks</h3>
            <div class="value">${report.metrics.overdueTasks}</div>
          </div>
          <div class="metric-card">
            <h3>Hours Logged</h3>
            <div class="value">${report.teamActivity.totalHoursLogged.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Team Activity</h2>
        <table>
          <tr>
            <td><strong>New Tasks This Week</strong></td>
            <td>${report.metrics.newTasksThisWeek}</td>
          </tr>
          <tr>
            <td><strong>Active Tasks</strong></td>
            <td>${report.metrics.activeTasks}</td>
          </tr>
          <tr>
            <td><strong>Time Entries</strong></td>
            <td>${report.teamActivity.entriesCount}</td>
          </tr>
          <tr>
            <td><strong>Total Hours</strong></td>
            <td>${report.teamActivity.totalHoursLogged.toFixed(1)} hours</td>
          </tr>
        </table>
      </div>
    `;
  }

  // Recent activity/milestones (both reports)
  html += `
      <div class="section">
        <h2>${isMonthly ? 'Recent Milestones' : 'Recent Activity'}</h2>
        ${(isMonthly ? report.recentMilestones : report.highlights).length > 0 ? 
          (isMonthly ? report.recentMilestones : report.highlights).map((activity: any) => `
            <div class="activity-item">
              <strong>${activity.description || activity.title || 'Activity'}</strong>
              <br/>
              <small style="color: #6b7280;">${new Date(activity.date || activity.createdAt).toLocaleDateString()}</small>
            </div>
          `).join('') 
          : '<p>No recent activity</p>'
        }
      </div>
    </div>
    <div class="footer">
      <p><strong>ClockSynk Team Dashboard</strong></p>
      <p>This is an automated ${isMonthly ? 'monthly' : 'weekly'} report. For questions, contact erin@clocksynk.com</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Send weekly report via email
 */
export async function sendWeeklyReport() {
  try {
    const report = await generateWeeklyReport();
    const htmlContent = formatReportAsHTML(report, false);
    
    // TODO: Integrate with email service
    // For now, log the report
    console.log("[Reporting] Weekly report generated:", report.title);
    console.log("[Reporting] Would send to: info@clocksynk.com (Erin, Jared, Bill)");
    
    return {
      success: true,
      report,
      htmlContent,
      recipients: ["erin@clocksynk.com", "jared@clocksynk.com", "bill@clocksynk.com"],
    };
  } catch (error) {
    console.error("[Reporting] Error sending weekly report:", error);
    throw error;
  }
}

/**
 * Send monthly report via email
 */
export async function sendMonthlyReport() {
  try {
    const report = await generateMonthlyReport();
    const htmlContent = formatReportAsHTML(report, true);
    
    // TODO: Integrate with email service
    // For now, log the report
    console.log("[Reporting] Monthly report generated:", report.title);
    console.log("[Reporting] Would send to: erin@clocksynk.com + board member");
    
    return {
      success: true,
      report,
      htmlContent,
      recipients: ["erin@clocksynk.com", "board@clocksynk.com"],
    };
  } catch (error) {
    console.error("[Reporting] Error sending monthly report:", error);
    throw error;
  }
}

