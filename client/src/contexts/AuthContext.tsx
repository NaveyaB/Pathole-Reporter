import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/services";
import { TOKEN_KEY } from "@/lib/api";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: Role | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, unknown>) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
    };
    window.addEventListener("spr:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("spr:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const res = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      /* noop */
    }
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      role: user?.role ?? null,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, loading, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthProvider;
