/* eslint-disable react-refresh/only-export-components */
import type { User } from "@supabase/supabase-js";
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const configurationError =
  "Supabase is not configured yet. Add the project URL and publishable key to .env.local.";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(
    isSupabaseConfigured &&
      ["/app", "/login", "/signup", "/reset-password"].includes(
        window.location.pathname
      )
  );
  const [initialized, setInitialized] = useState(false);

  const initialize = useCallback(async () => {
    if (initialized) return;
    setInitialized(true);
    const client = await getSupabase();
    if (!client) {
      setLoading(false);
      return;
    }
    const { data } = await client.auth.getSession();
    setUser(data.session?.user ?? null);
    setLoading(false);
  }, [initialized]);

  useEffect(() => {
    if (!loading) return;
    void initialize();
  }, [initialize, loading]);

  useEffect(() => {
    if (!initialized) return;
    let active = true;
    let subscription: { unsubscribe: () => void } | undefined;
    void getSupabase().then((client) => {
      if (!client || !active) return;
      const result = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = result.data.subscription;
    });
    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [initialized]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      initialize,
      signIn: async (email, password) => {
        const client = await getSupabase();
        if (!client) return { error: configurationError };
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error?.message ?? null };
      },
      signUp: async (name, email, password) => {
        const client = await getSupabase();
        if (!client) return { error: configurationError };
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        return {
          error: error?.message ?? null,
          needsEmailConfirmation: Boolean(data.user && !data.session),
        };
      },
      resetPassword: async (email) => {
        const client = await getSupabase();
        if (!client) return { error: configurationError };
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error?.message ?? null };
      },
      updatePassword: async (password) => {
        const client = await getSupabase();
        if (!client) return { error: configurationError };
        const { error } = await client.auth.updateUser({ password });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        const client = await getSupabase();
        await client?.auth.signOut();
      },
    }),
    [initialize, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
