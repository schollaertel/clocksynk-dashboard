# ClockSynk Team Dashboard

A comprehensive team management dashboard built for ClockSynk startup, featuring Microsoft Teams-style interface with deep Google Workspace integration.

![ClockSynk Dashboard](./logo.png)

---

## Features

### Team Management
- **Board View** - Real-time overview of team status and activities
- **Daily Check-In** - Morning accountability system with clock in/out tracking
- **Task Management** - Kanban, list, and calendar views with Google Sheets sync
- **Team Chat** - Integrated Google Chat for seamless communication

### Google Workspace Integration
- **Google Sheets** - Single source of truth for tasks and data
- **Google Calendar** - Unified calendar with event management
- **Google Drive** - Embedded file browser and management
- **Google Meet** - Quick meeting creation and scheduling
- **OAuth Integration** - Secure API access with user consent

### Collaboration Tools
- **Announcements** - Team-wide broadcast messaging
- **Ideas Hub** - Collect and track team suggestions
- **Key Dates** - Important dates with Google Calendar sync
- **Social Media** - Campaign planning and content calendar

### Admin Features (Erin Only)
- **Reports** - Automated weekly/monthly team reports
- **Budget Tracking** - Financial metrics and QuickBooks integration
- **Role-Based Access** - Admin-only sections for sensitive data

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend:** Node.js, Express 4, tRPC 11
- **Database:** MySQL (Drizzle ORM)
- **Authentication:** Dual OAuth (Manus Auth + Google OAuth)
- **APIs:** Google Sheets, Calendar, Drive, Chat, Meet
- **Deployment:** Vercel (recommended) or Manus Platform

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL database
- Google Cloud Console project with OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/clocksynk-dashboard.git
cd clocksynk-dashboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the dashboard.

---

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your_random_32_character_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback

# Google Sheet
GOOGLE_SHEET_ID=your_google_sheet_id

# App Configuration
VITE_APP_TITLE=ClockSynk Team Dashboard
VITE_APP_LOGO=/logo.png
NODE_ENV=development
```

See `.env.vercel.template` for complete list of variables.

---

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using Vercel:

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

**Detailed instructions:** See `GITHUB_VERCEL_DEPLOYMENT_GUIDE.md`

**Quick checklist:** See `VERCEL_DEPLOYMENT_CHECKLIST.md`

### Manus Platform

Alternative deployment on Manus:

```bash
# Save checkpoint
webdev_save_checkpoint

# Publish to Manus subdomain
# Configure in Manus dashboard
```

---

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/oauth/google/callback`
   - Production: `https://your-domain.com/api/oauth/google/callback`

### 2. Enable Required APIs

Enable these APIs in Google Cloud Console:

- Google Sheets API
- Google Calendar API
- Google Drive API
- Google Chat API
- Google Meet API

### 3. Configure OAuth Consent Screen

- User type: Internal (for Google Workspace) or External
- Scopes: email, profile, drive.readonly, calendar, chat.spaces.readonly, chat.messages.readonly
- Test users: Add team member emails

---

## Google Sheets Structure

The dashboard syncs with a Google Sheet (ID: `1MvIb2iBnX-9WVlq89D6HDzzvaLi4zswdnNML5NEJCL8`).

### Required Sheets

1. **Sprint** - Active tasks and assignments
   - Columns: Task, Assignee, Status, Priority, Due Date, Description

2. **Team** - Team member information
   - Columns: Name, Email, Role, Status

3. **KeyDates** - Important dates and deadlines
   - Columns: Date, Event, Type, Notes

### Permissions

Make the sheet accessible:
- Share with "Anyone with link"
- Permission level: Viewer
- Or share directly with team member emails

---

## Project Structure

```
clocksynk-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client and utilities
│   │   └── index.css      # Global styles and theme
│   └── public/            # Static assets
├── server/                # Backend Express + tRPC
│   ├── _core/            # Framework core (OAuth, context)
│   ├── routers.ts        # tRPC API routes
│   ├── db.ts             # Database queries
│   ├── googleSheets.ts   # Google Sheets integration
│   └── googleAuthRoutes.ts # Google OAuth routes
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Table definitions
├── shared/               # Shared types and constants
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

---

## Key Files

- **`server/routers.ts`** - API endpoints (tRPC procedures)
- **`drizzle/schema.ts`** - Database schema
- **`client/src/App.tsx`** - Route configuration
- **`client/src/components/TeamsLayout.tsx`** - Main layout component
- **`server/googleSheets.ts`** - Google Sheets sync logic
- **`server/googleAuthRoutes.ts`** - OAuth callback handling

---

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm check            # Type check without building

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Generate and run migrations

# Code Quality
pnpm format           # Format code with Prettier
pnpm test             # Run tests
```

---

## Brand Guidelines

ClockSynk brand colors are defined in `client/src/index.css`:

- **Deep Blue** (#1e3a8a) - Primary brand color, navigation
- **Bright Green** (#10b981) - Success states, positive actions
- **Electric Blue** (#3b82f6) - Interactive elements, links
- **Energetic Orange** (#f97316) - Alerts, important actions

Logo and brand assets are in `/client/public/`.

---

## User Roles

### Admin (Erin)
- Full access to all features
- Can view Reports and Budget sections
- Manages team members and permissions
- Approves task requests

### Team Member (Jared, Bill)
- Access to Dashboard, Tasks, Calendar, Chat
- Can submit ideas and announcements
- Request tasks from admin
- Clock in/out for time tracking

---

## Authentication Flow

The dashboard uses a dual OAuth system:

1. **Manus Auth** - Primary login for dashboard access
2. **Google OAuth** - Secondary auth for Google Workspace API access

### Login Process

1. User clicks "Sign In"
2. Redirects to Manus OAuth portal
3. After login, returns to dashboard
4. User clicks "Connect Google Account" (if needed)
5. Authorizes Google OAuth scopes
6. Returns to dashboard with full access

---

## API Integration

### Google Sheets API

Syncs data from the Sprint sheet:

```typescript
// server/googleSheets.ts
export async function fetchSprintTasks(accessToken: string) {
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sprint!A:F',
  });
  return response.data.values;
}
```

### Google Calendar API

Creates and syncs events:

```typescript
// server/routers.ts
calendar.syncKeyDate.useMutation(async ({ dateId }) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  await calendar.events.insert({
    calendarId: 'primary',
    resource: eventData,
  });
});
```

---

## Troubleshooting

### OAuth Callback 404

**Problem:** After Google OAuth, redirects to 404 page

**Solution:**
1. Verify `GOOGLE_REDIRECT_URI` matches your domain
2. Check Google Cloud Console has correct redirect URI
3. Ensure route exists in `server/googleAuthRoutes.ts`

### Sheets Not Loading

**Problem:** Google Sheets data doesn't display

**Solution:**
1. Make sheet public: "Anyone with link" → "Viewer"
2. Verify `GOOGLE_SHEET_ID` is correct
3. Check OAuth scopes include `spreadsheets.readonly`
4. Reconnect Google account

### Database Connection Failed

**Problem:** "Cannot connect to database" errors

**Solution:**
1. Verify `DATABASE_URL` format is correct
2. Check database is running and accessible
3. For PlanetScale, ensure SSL is enabled
4. Test connection string locally

---

## Contributing

This is a private project for ClockSynk team. For changes:

1. Create a feature branch
2. Make your changes
3. Test locally
4. Push and create Pull Request
5. Vercel creates preview deployment
6. Review and merge to main

---

## Support

For issues or questions:

- **Technical Issues:** Check `GITHUB_VERCEL_DEPLOYMENT_GUIDE.md`
- **User Guide:** See `CLOCKSYNK_SETUP_GUIDE.md`
- **Authentication:** See `AUTHENTICATION_SOLUTION.md`

---

## License

MIT License - Copyright (c) 2025 ClockSynk

---

## Acknowledgments

- Built with [Manus AI](https://manus.im)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Hosted on [Vercel](https://vercel.com)
- Database by [PlanetScale](https://planetscale.com)

---

**Version:** 1.0.0  
**Last Updated:** October 23, 2025  
**Maintained By:** ClockSynk Team

