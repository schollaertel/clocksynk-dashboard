/**
 * Google API tRPC Router
 * 
 * Provides tRPC procedures for accessing Google Workspace APIs
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { listDriveFiles, listCalendarEvents } from "./googleOAuth";
import { getUserTokens } from "./googleAuthRoutes";

export const googleApiRouter = router({
  /**
   * Check if user has connected Google account
   */
  isConnected: protectedProcedure.query(({ ctx }) => {
    const tokens = getUserTokens(ctx.user.id);
    return {
      connected: !!tokens,
      email: tokens?.userInfo?.email,
    };
  }),

  /**
   * List Google Drive files
   */
  drive: router({
    list: protectedProcedure
      .input(
        z.object({
          query: z.string().optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const tokens = getUserTokens(ctx.user.id);
        if (!tokens || !tokens.access_token) {
          throw new Error("Google account not connected");
        }

        try {
          const files = await listDriveFiles(
            tokens.access_token,
            input?.query
          );
          return files;
        } catch (error) {
          console.error("[Google Drive] Error listing files:", error);
          throw new Error("Failed to fetch Drive files");
        }
      }),
  }),

  /**
   * List Google Calendar events
   */
  calendar: router({
    list: protectedProcedure
      .input(
        z.object({
          calendarId: z.string().optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const tokens = getUserTokens(ctx.user.id);
        if (!tokens || !tokens.access_token) {
          throw new Error("Google account not connected");
        }

        try {
          const events = await listCalendarEvents(
            tokens.access_token,
            input?.calendarId
          );
          return events;
        } catch (error) {
          console.error("[Google Calendar] Error listing events:", error);
          throw new Error("Failed to fetch calendar events");
        }
      }),
    createEvent: protectedProcedure
      .input(
        z.object({
          summary: z.string(),
          description: z.string().optional(),
          start: z.string(), // ISO date string
          end: z.string().optional(),
          attendees: z.array(z.string()).optional(),
          calendarId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const tokens = getUserTokens(ctx.user.id);
        if (!tokens || !tokens.access_token) {
          throw new Error("Google account not connected");
        }

        try {
          const { createCalendarEvent } = await import("./googleOAuth");
          const event = await createCalendarEvent(
            tokens.access_token,
            {
              summary: input.summary,
              description: input.description,
              start: input.start,
              end: input.end,
              attendees: input.attendees,
            },
            input.calendarId
          );
          return event;
        } catch (error) {
          console.error("[Google Calendar] Error creating event:", error);
          throw new Error("Failed to create calendar event");
        }
      }),
  }),
});

