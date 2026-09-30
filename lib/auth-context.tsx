"use client";

// ===== lib/auth-context.tsx — estado de sesión mock compartido (portado de app.jsx) =====

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type AuthUser = { name: string } | null;

type Listener = () => void;

const listeners = new Set<Listener>();
let cachedUser: AuthUser = null;
let hydrated = false;

function readUser(): AuthUser {
  try {
    return JSON.parse(localStorage.getItem("av_user") || "null");
  } catch {
    return null;
  }
}

function subscribeUser(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getUserSnapshot(): AuthUser {
  if (!hydrated) {
    cachedUser = readUser();
    hydrated = true;
  }
  return cachedUser;
}

function getServerUserSnapshot(): AuthUser {
  return null;
}

function setStoredUser(user: AuthUser) {
  cachedUser = user;
  listeners.forEach((listener) => listener());
}

export type ScoreEntry = {
  game: string;
  score: number;
  name: string;
  at: number;
};

type AuthContextValue = {
  user: AuthUser;
  login: (user: NonNullable<AuthUser>) => void;
  signOut: () => void;
  saveScore: (entry: Omit<ScoreEntry, "at">) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const login = (u: NonNullable<AuthUser>) => {
    localStorage.setItem("av_user", JSON.stringify(u));
    setStoredUser(u);
  };

  const signOut = () => {
    localStorage.removeItem("av_user");
    setStoredUser(null);
  };

  const saveScore = (entry: Omit<ScoreEntry, "at">) => {
    try {
      const all = JSON.parse(localStorage.getItem("av_scores") || "[]");
      all.push({ ...entry, at: Date.now() });
      localStorage.setItem("av_scores", JSON.stringify(all));
    } catch {
      // localStorage no disponible: ignorar el guardado
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signOut, saveScore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
