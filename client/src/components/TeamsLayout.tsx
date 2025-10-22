import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  LayoutDashboard,
  CheckSquare,
  Megaphone,
  Lightbulb,
  Calendar,
  MessageSquare,
  Video,
  Table,
  Search,
  Settings,
  LogOut,
  FolderOpen,
  CheckCircle2,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamsLayoutProps {
  children: ReactNode;
}

export default function TeamsLayout({ children }: TeamsLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Check-In", href: "/check-in", icon: CheckCircle2 },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Sheets", href: "/sheets", icon: Table },
    { name: "Drive", href: "/drive", icon: FolderOpen },
    { name: "Meet", href: "/meet", icon: Video },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
    { name: "Ideas", href: "/ideas", icon: Lightbulb },
    { name: "Key Dates", href: "/key-dates", icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation Bar - Teams Style */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
        {/* Left: Logo and App Title */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt={APP_TITLE} className="h-8 w-8 object-contain" />
          <span className="text-sm font-semibold text-foreground">{APP_TITLE}</span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search in ClockSynk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-background"
            />
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Teams Style Rail */}
        <aside className="flex w-16 flex-col items-center gap-2 border-r border-border bg-card py-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`group relative flex h-12 w-12 flex-col items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                title={item.name}
              >
                <Icon className="h-5 w-5" />
                {active && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r" />
                )}
                {/* Tooltip on hover */}
                <span className="absolute left-16 z-50 hidden group-hover:block whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">
                  {item.name}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

