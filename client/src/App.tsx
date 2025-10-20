import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Announcements from "./pages/Announcements";
import Ideas from "./pages/Ideas";
import KeyDates from "./pages/KeyDates";
import Chat from "./pages/Chat";
import Sheets from "./pages/Sheets";
import Meet from "./pages/Meet";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/announcements"} component={Announcements} />
      <Route path={"/ideas"} component={Ideas} />
      <Route path={"/key-dates"} component={KeyDates} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/sheets"} component={Sheets} />
      <Route path={"/meet"} component={Meet} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
