/**
 * Notification system for ClockSynk Dashboard
 * Handles @mentions and team notifications
 */

// Team member email mapping
const TEAM_EMAILS: Record<string, string> = {
  "erin": "erin@clocksynk.com",
  "jared": "jared@clocksynk.com",
  "bill": "bill@clocksynk.com",
  "all": "info@clocksynk.com", // Sends to all three
};

interface Notification {
  to: string[];
  subject: string;
  message: string;
  type: "mention" | "task" | "announcement" | "report" | "system";
  priority?: "low" | "medium" | "high";
}

/**
 * Parse @mentions from text content
 * Supports: @erin, @jared, @bill, @all
 */
export function parseMentions(text: string): string[] {
  const mentionRegex = /@(erin|jared|bill|all)/gi;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];
  
  const uniqueMentions = new Set(
    matches.map(m => m.toLowerCase().replace('@', ''))
  );
  
  return Array.from(uniqueMentions);
}

/**
 * Get email addresses for mentioned users
 */
export function getMentionedEmails(mentions: string[]): string[] {
  const emails = new Set<string>();
  
  for (const mention of mentions) {
    const email = TEAM_EMAILS[mention.toLowerCase()];
    if (email) {
      if (mention.toLowerCase() === "all") {
        // Add all team members
        emails.add("erin@clocksynk.com");
        emails.add("jared@clocksynk.com");
        emails.add("bill@clocksynk.com");
      } else {
        emails.add(email);
      }
    }
  }
  
  return Array.from(emails);
}

/**
 * Send notification email
 * Currently logs to console - integrate with email service later
 */
export async function sendNotification(notification: Notification): Promise<boolean> {
  try {
    console.log("[Notifications] Sending notification:", {
      to: notification.to,
      subject: notification.subject,
      type: notification.type,
      priority: notification.priority || "medium",
    });
    
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // For now, just log the notification
    console.log("[Notifications] Message:", notification.message);
    
    return true;
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error);
    return false;
  }
}

/**
 * Send @mention notifications
 */
export async function sendMentionNotifications(
  text: string,
  context: {
    author: string;
    authorEmail: string;
    location: string; // e.g., "Task: Website Redesign" or "Announcement: Team Meeting"
    url?: string;
  }
): Promise<void> {
  const mentions = parseMentions(text);
  
  if (mentions.length === 0) return;
  
  const emails = getMentionedEmails(mentions);
  
  // Don't notify the author
  const recipientEmails = emails.filter(email => email !== context.authorEmail);
  
  if (recipientEmails.length === 0) return;
  
  const notification: Notification = {
    to: recipientEmails,
    subject: `${context.author} mentioned you in ClockSynk`,
    message: `
      <h2>You were mentioned</h2>
      <p><strong>${context.author}</strong> mentioned you in <strong>${context.location}</strong></p>
      <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; margin: 20px 0; color: #374151;">
        ${text}
      </blockquote>
      ${context.url ? `<p><a href="${context.url}" style="color: #3b82f6;">View in Dashboard →</a></p>` : ''}
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from ClockSynk Team Dashboard.
      </p>
    `,
    type: "mention",
    priority: "medium",
  };
  
  await sendNotification(notification);
}

/**
 * Send task assignment notification
 */
export async function sendTaskAssignmentNotification(
  taskTitle: string,
  assignedTo: string,
  assignedBy: string,
  dueDate?: Date
): Promise<void> {
  const email = TEAM_EMAILS[assignedTo.toLowerCase()];
  
  if (!email) return;
  
  const notification: Notification = {
    to: [email],
    subject: `New task assigned: ${taskTitle}`,
    message: `
      <h2>New Task Assigned</h2>
      <p><strong>${assignedBy}</strong> assigned you a new task:</p>
      <h3 style="color: #1e3a8a;">${taskTitle}</h3>
      ${dueDate ? `<p><strong>Due:</strong> ${dueDate.toLocaleDateString()}</p>` : ''}
      <p><a href="${process.env.VITE_APP_URL || 'https://dashboard.clocksynk.com'}/tasks" style="color: #3b82f6;">View Task →</a></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from ClockSynk Team Dashboard.
      </p>
    `,
    type: "task",
    priority: "high",
  };
  
  await sendNotification(notification);
}

/**
 * Send announcement notification
 */
export async function sendAnnouncementNotification(
  title: string,
  content: string,
  priority: "low" | "medium" | "high",
  createdBy: string
): Promise<void> {
  const notification: Notification = {
    to: ["erin@clocksynk.com", "jared@clocksynk.com", "bill@clocksynk.com"],
    subject: `${priority === "high" ? "🔴 URGENT: " : ""}${title}`,
    message: `
      <h2>${title}</h2>
      <p><strong>From:</strong> ${createdBy}</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${content}
      </div>
      <p><a href="${process.env.VITE_APP_URL || 'https://dashboard.clocksynk.com'}/announcements" style="color: #3b82f6;">View Announcements →</a></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from ClockSynk Team Dashboard.
      </p>
    `,
    type: "announcement",
    priority,
  };
  
  await sendNotification(notification);
}

/**
 * Send task request notification to admin
 */
export async function sendTaskRequestNotification(
  title: string,
  requestedBy: string,
  priority: "low" | "medium" | "high"
): Promise<void> {
  const notification: Notification = {
    to: ["erin@clocksynk.com"],
    subject: `New task request from ${requestedBy}`,
    message: `
      <h2>New Task Request</h2>
      <p><strong>${requestedBy}</strong> has requested a new task:</p>
      <h3 style="color: #1e3a8a;">${title}</h3>
      <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
      <p><a href="${process.env.VITE_APP_URL || 'https://dashboard.clocksynk.com'}/tasks" style="color: #3b82f6;">Review Request →</a></p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">
        This is an automated notification from ClockSynk Team Dashboard.
      </p>
    `,
    type: "task",
    priority: "medium",
  };
  
  await sendNotification(notification);
}

/**
 * Send weekly report notification
 */
export async function sendWeeklyReportNotification(reportHtml: string): Promise<void> {
  const notification: Notification = {
    to: ["erin@clocksynk.com", "jared@clocksynk.com", "bill@clocksynk.com"],
    subject: "ClockSynk Weekly Team Report",
    message: reportHtml,
    type: "report",
    priority: "medium",
  };
  
  await sendNotification(notification);
}

/**
 * Send monthly report notification
 */
export async function sendMonthlyReportNotification(reportHtml: string): Promise<void> {
  const notification: Notification = {
    to: ["erin@clocksynk.com", "board@clocksynk.com"],
    subject: "ClockSynk Monthly Business Report",
    message: reportHtml,
    type: "report",
    priority: "high",
  };
  
  await sendNotification(notification);
}

