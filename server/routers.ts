import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { googleApiRouter } from "./googleApiRouter";

export const appRouter = router({
  system: systemRouter,
  google: googleApiRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ClockSynk Dashboard Routers
  tasks: router({
    list: publicProcedure.query(async () => {
      try {
        const { getTasks } = await import("./googleSheets");
        return await getTasks();
      } catch (error) {
        console.error('[Tasks] Error fetching tasks:', error);
        return [];
      }
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          assignedTo: z.string().optional(),
          status: z.enum(["pending", "in_progress", "overdue", "done"]).default("pending"),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
          category: z.string().optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createTask } = await import("./db");
        return createTask({ ...input, createdBy: ctx.user.id });
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          assignedTo: z.string().optional(),
          status: z.enum(["pending", "in_progress", "overdue", "done"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          category: z.string().optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTask } = await import("./db");
        const { id, ...updates } = input;
        return updateTask(id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteTask } = await import("./db");
        return deleteTask(input.id);
      }),
  }),

  taskRequests: router({    list: protectedProcedure.query(async ({ ctx }) => {
      const { getTaskRequests } = await import("./db");
      // Admin sees all, team members see only their own
      if (ctx.user.email === "erin@clocksynk.com") {
        return getTaskRequests();
      }
      return getTaskRequests(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createTaskRequest } = await import("./db");
        return createTaskRequest({ ...input, requestedBy: ctx.user.id });
      }),
    approve: protectedProcedure
      .input(z.object({ id: z.string(), assignTo: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can approve
        if (ctx.user.email !== "erin@clocksynk.com") {
          throw new Error("Only admin can approve task requests");
        }
        const { approveTaskRequest } = await import("./db");
        return approveTaskRequest(input.id, ctx.user.id, input.assignTo);
      }),
    reject: protectedProcedure
      .input(z.object({ id: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can reject
        if (ctx.user.email !== "erin@clocksynk.com") {
          throw new Error("Only admin can reject task requests");
        }
        const { rejectTaskRequest } = await import("./db");
        return rejectTaskRequest(input.id, ctx.user.id, input.reason);
      }),
  }),

  announcements: router({
    list: publicProcedure.query(async () => {
      const { getAnnouncements } = await import("./db");
      return getAnnouncements();
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
          category: z.string().optional(),
          isPinned: z.enum(["yes", "no"]).default("no"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createAnnouncement } = await import("./db");
        return createAnnouncement({ ...input, createdBy: ctx.user.id });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteAnnouncement } = await import("./db");
        return deleteAnnouncement(input.id);
      }),
  }),

  ideas: router({
    list: publicProcedure.query(async () => {
      const { getIdeas } = await import("./db");
      return getIdeas();
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          category: z.enum(["innovation", "process", "product", "marketing"]).default("innovation"),
          priority: z.enum(["low", "medium", "high"]).default("medium"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createIdea } = await import("./db");
        return createIdea({ ...input, submittedBy: ctx.user.id });
      }),
    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(["submitted", "under_review", "in_progress", "implemented", "archived"]),
        })
      )
      .mutation(async ({ input }) => {
        const { updateIdeaStatus } = await import("./db");
        return updateIdeaStatus(input.id, input.status);
      }),
  }),

  dailyFocus: router({
    today: publicProcedure.query(async () => {
      const { getTodaysFocus } = await import("./db");
      return getTodaysFocus();
    }),
    create: protectedProcedure
      .input(z.object({ focusText: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { createDailyFocus } = await import("./db");
        return createDailyFocus({ ...input, userId: ctx.user.id });
      }),
  }),

  keyDates: router({
    list: publicProcedure.query(async () => {
      const { getKeyDates } = await import("./db");
      return getKeyDates();
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          date: z.date(),
          type: z.enum(["deadline", "launch", "meeting", "event"]).default("event"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createKeyDate } = await import("./db");
        return createKeyDate({ ...input, createdBy: ctx.user.id });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteKeyDate } = await import("./db");
        return deleteKeyDate(input.id);
      }),
  }),

  // Time Tracking
  timeTracking: router({    getTodayEntry: protectedProcedure.query(async ({ ctx }) => {
      const { getTodayTimeEntry } = await import("./db");
      return getTodayTimeEntry(ctx.user.id);
    }),
    clockIn: protectedProcedure
      .input(z.object({ notes: z.string().optional() }).optional())
      .mutation(async ({ input, ctx }) => {
        const { clockIn } = await import("./db");
        return clockIn(ctx.user.id, input?.notes);
      }),
    clockOut: protectedProcedure
      .input(z.object({ notes: z.string().optional() }).optional())
      .mutation(async ({ input, ctx }) => {
        const { clockOut } = await import("./db");
        return clockOut(ctx.user.id, input?.notes);
      }),
    getWeeklyHours: protectedProcedure.query(async ({ ctx }) => {
      const { getWeeklyHours } = await import("./db");
      return getWeeklyHours(ctx.user.id);
    }),
  }),

  // Daily Check-In
  checkIn: router({    submit: protectedProcedure
      .input(z.object({ goal: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { createDailyFocus } = await import("./db");
        return createDailyFocus({ focusText: input.goal, userId: ctx.user.id });
      }),
  }),

  // Client Portal
  clientPortal: router({
    getProjects: protectedProcedure.query(async ({ ctx }) => {
      const { getClientProjects } = await import("./db");
      return getClientProjects(ctx.user.id);
    }),
    getUpdates: protectedProcedure.query(async ({ ctx }) => {
      const { getProjectUpdates } = await import("./db");
      return getProjectUpdates(ctx.user.id);
    }),
    sendMessage: protectedProcedure
      .input(z.object({ message: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { createProjectUpdate } = await import("./db");
        return createProjectUpdate({ message: input.message, author: ctx.user.id });
      }),
  }),

  // Board Member View
  boardView: router({
    getMetrics: publicProcedure.query(async () => {
      const { getBoardMetrics } = await import("./db");
      return getBoardMetrics();
    }),
    getRecentActivity: publicProcedure.query(async () => {
      const { getRecentActivity } = await import("./db");
      return getRecentActivity();
    }),
  }),

  // Automated Reporting
  reporting: router({
    generateWeeklyReport: protectedProcedure.query(async () => {
      const { generateWeeklyReport } = await import("./reporting");
      return generateWeeklyReport();
    }),
    generateMonthlyReport: protectedProcedure.query(async () => {
      const { generateMonthlyReport } = await import("./reporting");
      return generateMonthlyReport();
    }),
    sendWeeklyReport: protectedProcedure.mutation(async () => {
      const { sendWeeklyReport } = await import("./reporting");
      return sendWeeklyReport();
    }),
    sendMonthlyReport: protectedProcedure.mutation(async () => {
      const { sendMonthlyReport } = await import("./reporting");
      return sendMonthlyReport();
    }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }))
      .query(async ({ input, ctx }) => {
        const { getUserNotifications } = await import("./db");
        return getUserNotifications(ctx.user.id, input.unreadOnly);
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      const { getUnreadNotificationCount } = await import("./db");
      return getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { markNotificationAsRead } = await import("./db");
        return markNotificationAsRead(input.id);
      }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      const { markAllNotificationsAsRead } = await import("./db");
      return markAllNotificationsAsRead(ctx.user.id);
    }),
  }),

  // QuickBooks Integration
  quickbooks: router({
    getStatus: protectedProcedure.query(async () => {
      const { getCompanyInfo, isQuickBooksConfigured } = await import("./quickbooks");
      return {
        configured: isQuickBooksConfigured(),
        company: await getCompanyInfo(),
      };
    }),
    getFinancialMetrics: protectedProcedure.query(async () => {
      const { getFinancialMetrics } = await import("./quickbooks");
      return getFinancialMetrics();
    }),
  }),

  // Budget Tracking
  budget: router({
    listProjectBudgets: protectedProcedure.query(async () => {
      const { getProjectBudgets } = await import("./db");
      return getProjectBudgets();
    }),
    createProjectBudget: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          budget: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { createProjectBudget } = await import("./db");
        return createProjectBudget(input.projectId, input.budget);
      }),
  }),

  // Social Media Campaign Management
  socialMedia: router({
    listCampaigns: protectedProcedure.query(async () => {
      const { getSocialCampaigns } = await import("./db");
      return getSocialCampaigns();
    }),
    getContentCalendar: protectedProcedure.query(async () => {
      const { getContentCalendar } = await import("./db");
      return getContentCalendar();
    }),
    listContentIdeas: protectedProcedure.query(async () => {
      const { getContentIdeas } = await import("./db");
      return getContentIdeas();
    }),
    submitContentIdea: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createContentIdea } = await import("./db");
        return createContentIdea({ ...input, submittedBy: ctx.user.id });
      }),
  }),

  // Google Sheets Lookup
  sheets: router({
    fetchData: publicProcedure
      .input(
        z.object({
          spreadsheetId: z.string(),
          range: z.string().default("Sheet1"),
        })
      )
      .query(async ({ input }) => {
        const { fetchSheetData } = await import("./sheetsLookup");
        return fetchSheetData(input.spreadsheetId, input.range);
      }),
    lookup: publicProcedure
      .input(
        z.object({
          spreadsheetId: z.string(),
          range: z.string().default("Sheet1"),
          lookupColumn: z.string(),
          lookupValue: z.union([z.string(), z.number()]),
          returnColumn: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { fetchSheetData, lookupValue } = await import("./sheetsLookup");
        const data = await fetchSheetData(input.spreadsheetId, input.range);
        return lookupValue(data, input.lookupColumn, input.lookupValue, input.returnColumn);
      }),
  }),
});

export type AppRouter = typeof appRouter;
