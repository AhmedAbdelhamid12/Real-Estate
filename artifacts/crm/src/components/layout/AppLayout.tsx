import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      setLocation("/login");
    }
  }, [currentUser, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/20" />
          <div className="h-4 w-24 bg-primary/20 rounded" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
