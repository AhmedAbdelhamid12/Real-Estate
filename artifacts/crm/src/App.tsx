import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
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
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
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

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType; path: string }) {
  const { currentUser, isLoading } = useAuth();
  return (
    <Route
      {...rest}
      component={() => {
        if (isLoading) return null;
        if (!currentUser) return <Redirect to="/login" />;
        return (
          <AppLayout>
            <HeartbeatInit />
            <Component />
          </AppLayout>
        );
      }}
    />
  );
}

function Router() {
  const { currentUser, isLoading } = useAuth();
  return (
    <Switch>
      <Route path="/">
        {() => {
          if (isLoading) return null;
          if (currentUser) return <Redirect to="/home" />;
          return <Redirect to="/login" />;
        }}
      </Route>

      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/pending-approval" component={PendingApprovalPage} />

      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/leads" component={LeadsListPage} />
      <ProtectedRoute path="/leads/kanban" component={LeadsKanbanPage} />
      <ProtectedRoute path="/leads/:id" component={LeadDetailPage} />
      <ProtectedRoute path="/projects" component={ProjectsPage} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetailPage} />
      <ProtectedRoute path="/resale" component={ResalePage} />
      <ProtectedRoute path="/clients" component={ClientsPage} />
      <ProtectedRoute path="/clients/:id" component={ClientDetailPage} />
      <ProtectedRoute path="/employees" component={EmployeesPage} />
      <ProtectedRoute path="/employees/pending" component={PendingEmployeesPage} />
      <ProtectedRoute path="/employees/:id" component={EmployeeDetailPage} />
      <ProtectedRoute path="/planner" component={PlannerPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/permissions" component={PermissionsPage} />

      <Route component={NotFound} />
    </Switch>
  );
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
