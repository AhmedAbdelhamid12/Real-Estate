import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { apiFetch } from "@workspace/api-client-react";

interface PermissionsContextType {
  permissions: Record<string, boolean>;
  can: (key: string) => boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: {},
  can: () => false,
  isLoading: true,
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["permissions", "me"],
    queryFn: async () => {
      const res = await apiFetch("/api/permissions/me");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json() as Promise<{ permissions: Record<string, boolean> }>;
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  });

  const permissions = data?.permissions ?? {};

  const can = (key: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === "ceo" || currentUser.role === "admin") return true;
    return permissions[key] ?? false;
  };

  return (
    <PermissionsContext.Provider value={{ permissions, can, isLoading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

