'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as apiLogin, refreshToken as apiRefresh, logout as apiLogout } from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  USER: 'admin_user',
};

function getStoredValue<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredValue(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

function removeStoredValue(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: getStoredValue<AuthUser>(STORAGE_KEYS.USER),
    accessToken: getStoredValue<string>(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: getStoredValue<string>(STORAGE_KEYS.REFRESH_TOKEN),
    loading: false,
    error: null,
  });

  // Token refresh: attempt refresh every 10 minutes (tokens expire in 15)
  useEffect(() => {
    if (!state.refreshToken || !state.accessToken) return;

    const interval = setInterval(
      async () => {
        try {
          const res = await apiRefresh(state.refreshToken!);
          setStoredValue(STORAGE_KEYS.ACCESS_TOKEN, res.access_token);
          setState((prev) => ({ ...prev, accessToken: res.access_token }));
        } catch {
          removeStoredValue(STORAGE_KEYS.ACCESS_TOKEN);
          removeStoredValue(STORAGE_KEYS.REFRESH_TOKEN);
          removeStoredValue(STORAGE_KEYS.USER);
          setState({
            user: null,
            accessToken: null,
            refreshToken: null,
            loading: false,
            error: null,
          });
        }
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [state.refreshToken, state.accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await apiLogin(email, password);
      const user: AuthUser = {
        id: res.user.id,
        email: res.user.email,
        display_name: res.user.display_name,
        role: res.user.role,
      };

      setStoredValue(STORAGE_KEYS.ACCESS_TOKEN, res.access_token);
      setStoredValue(STORAGE_KEYS.REFRESH_TOKEN, res.refresh_token);
      setStoredValue(STORAGE_KEYS.USER, user);

      setState({
        user,
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout().catch(() => {});
    removeStoredValue(STORAGE_KEYS.ACCESS_TOKEN);
    removeStoredValue(STORAGE_KEYS.REFRESH_TOKEN);
    removeStoredValue(STORAGE_KEYS.USER);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
    });
    window.location.href = '/admin/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated: !!state.user && !!state.accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
