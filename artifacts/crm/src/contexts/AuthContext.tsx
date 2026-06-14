import { createContext, useContext, useEffect, ReactNode } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: currentUser, isLoading, refetch, error } = useGetMe();

  const [_, setLocation] = useLocation();

  if (currentUser?.status === "pending" && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-4 p-8 border rounded-lg shadow-sm bg-card">
          <h2 className="text-2xl font-bold tracking-tight">Account Pending</h2>
          <p className="text-muted-foreground">
            Your account is currently pending approval from an administrator.
            You will be able to access the system once approved.
          </p>
          <button
            onClick={() => setLocation("/login")}
            className="text-primary hover:underline text-sm font-medium"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser: currentUser || null, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
