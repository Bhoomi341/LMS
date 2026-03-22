"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiClient, getAccessToken, setAccessToken } from "@/lib/api-client";

export type User = { id: number; email: string; name: string };

type AuthState = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getAccessToken();
    if (!t) {
      setUser(null);
      setTokenState(null);
      return;
    }
    setTokenState(t);
    try {
      const { data } = await apiClient.get<User>("/api/auth/me");
      setUser(data);
    } catch {
      setAccessToken(null);
      setUser(null);
      setTokenState(null);
    }
  }, []);

  useEffect(() => {
    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<{ accessToken: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setTokenState(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await apiClient.post<{ accessToken: string; user: User }>("/api/auth/register", {
      email,
      password,
      name,
    });
    setAccessToken(data.accessToken);
    setTokenState(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout", {});
    } catch {
      /* still clear client state */
    }
    setAccessToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, accessToken, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
