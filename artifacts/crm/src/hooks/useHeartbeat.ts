import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@workspace/api-client-react";

const HEARTBEAT_INTERVAL = 30_000;

export function useHeartbeat() {
  const { currentUser } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const ping = () => {
      apiFetch("/api/heartbeat", { method: "POST" }).catch(() => {});
    };

    ping();
    intervalRef.current = setInterval(ping, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentUser]);
}
