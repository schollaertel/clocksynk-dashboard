import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

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
      const { getTasks } = await import("./db");
      return getTasks();
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
});

export type AppRouter = typeof appRouter;
