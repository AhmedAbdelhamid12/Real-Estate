import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/i18nContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import NotFound from "@/pages/not-found";

// Auth pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";
import { PendingApprovalPage } from "@/pages/auth/PendingApprovalPage";

// Dashboard pages
import { HomePage } from "@/pages/home/HomePage";
import { LeadsListPage } from "@/pages/leads/LeadsListPage";
import { LeadsKanbanPage } from "@/pages/leads/LeadsKanbanPage";
import { LeadDetailPage } from "@/pages/leads/LeadDetailPage";
import { ProjectsPage } from "@/pages/projects/ProjectsPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { ResalePage } from "@/pages/resale/ResalePage";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { ClientDetailPage } from "@/pages/clients/ClientDetailPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { PendingEmployeesPage } from "@/pages/employees/PendingEmployeesPage";
import { EmployeeDetailPage } from "@/pages/employees/EmployeeDetailPage";
import { PlannerPage } from "@/pages/planner/PlannerPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { PermissionsPage } from "@/pages/permissions/PermissionsPage";

function HeartbeatInit() {
  useHeartbeat();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/pending-approval"];

function ProtectedPages() {
  const { currentUser, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) return null;
  if (!currentUser) return <Redirect to="/login" />;

  return (
    <AppLayout>
      <HeartbeatInit />
      <Switch>
        <Route path="/home" component={HomePage} />
        <Route path="/leads" component={LeadsListPage} />
        <Route path="/leads/kanban" component={LeadsKanbanPage} />
        <Route path="/leads/:id" component={LeadDetailPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:id" component={ProjectDetailPage} />
        <Route path="/resale" component={ResalePage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/:id" component={ClientDetailPage} />
        <Route path="/employees" component={EmployeesPage} />
        <Route path="/employees/pending" component={PendingEmployeesPage} />
        <Route path="/employees/:id" component={EmployeeDetailPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/permissions" component={PermissionsPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  const { currentUser, isLoading } = useAuth();
  const [location] = useLocation();

  const isAuthPath = AUTH_PATHS.some(p => location.startsWith(p));

  if (isAuthPath) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        <Route path="/verify-email" component={VerifyEmailPage} />
        <Route path="/pending-approval" component={PendingApprovalPage} />
      </Switch>
    );
  }

  if (location === "/") {
    if (isLoading) return null;
    return currentUser ? <Redirect to="/home" /> : <Redirect to="/login" />;
  }

  return <ProtectedPages />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <I18nProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AuthProvider>
                <PermissionsProvider>
                  <Router />
                </PermissionsProvider>
              </AuthProvider>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
