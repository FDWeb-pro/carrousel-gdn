import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import History from "./pages/History";
import AdminUsers from "./pages/AdminUsers";
import AdminSlideTypes from "./pages/AdminSlideTypes";
import AdminSmtp from "@/pages/AdminSmtp";
import AdminAudit from "@/pages/AdminAudit";
import PendingApproval from "./pages/PendingApproval";
import AccessDenied from "./pages/AccessDenied";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { getLoginUrl } from "./const";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Check user status
  if (user.status === 'pending') {
    return <Redirect to="/pending" />;
  }

  if (user.status === 'rejected') {
    return <Redirect to="/access-denied" />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Generator} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} adminOnly />} />
      <Route path="/admin/slide-types" component={() => <ProtectedRoute component={AdminSlideTypes} adminOnly />} />
      <Route path="/admin/smtp" component={() => <ProtectedRoute component={AdminSmtp} adminOnly />} />
      <Route path="/admin/audit" component={() => <ProtectedRoute component={AdminAudit} adminOnly />} />
      <Route path="/pending" component={PendingApproval} />
      <Route path="/access-denied" component={AccessDenied} />
      <Route path="/404" component={NotFound} />
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
