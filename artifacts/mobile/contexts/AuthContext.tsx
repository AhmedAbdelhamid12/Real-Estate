import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const API_BASE = DOMAIN ? `https://${DOMAIN}/api` : "/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string | null;
  title?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const savedToken = await AsyncStorage.getItem("auth_token");
      if (savedToken) {
        setToken(savedToken);
        const me = await fetchMe(savedToken);
        setUser(me);
      }
    } catch {
      await AsyncStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMe(tok: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${tok}`, Cookie: `token=${tok}` },
    });
    if (!res.ok) throw new Error("Session expired");
    return res.json() as Promise<User>;
  }

  async function signIn(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? "Login failed");
    }
    const data = await res.json() as { user: User; token?: string; accessToken?: string };
    const tok = data.token ?? data.accessToken ?? "";
    if (tok) await AsyncStorage.setItem("auth_token", tok);
    setToken(tok || null);
    setUser(data.user);
  }

  async function signOut(): Promise<void> {
    await AsyncStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
