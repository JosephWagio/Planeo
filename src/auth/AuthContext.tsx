/* eslint-disable react-refresh/only-export-components */
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
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
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isSupabaseConfigured,
      signIn: async (email, password) => {
        if (!supabase) return { error: configurationError };
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error?.message ?? null };
      },
      signUp: async (name, email, password) => {
        if (!supabase) return { error: configurationError };
        const { data, error } = await supabase.auth.signUp({
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
        if (!supabase) return { error: configurationError };
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        return { error: error?.message ?? null };
      },
      updatePassword: async (password) => {
        if (!supabase) return { error: configurationError };
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [loading, user]
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
