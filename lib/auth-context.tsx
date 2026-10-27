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

// Marcas guardadas (av_scores). Se conservan al cerrar sesión: son del dispositivo.
const EMPTY_SCORES: ScoreEntry[] = [];
let cachedScores: ScoreEntry[] = EMPTY_SCORES;
let scoresHydrated = false;

function readScores(): ScoreEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem("av_scores") || "[]");
    return Array.isArray(parsed) ? parsed : EMPTY_SCORES;
  } catch {
    return EMPTY_SCORES;
  }
}

function getScoresSnapshot(): ScoreEntry[] {
  if (!scoresHydrated) {
    cachedScores = readScores();
    scoresHydrated = true;
  }
  return cachedScores;
}

function getServerScoresSnapshot(): ScoreEntry[] {
  return EMPTY_SCORES;
}

/** Mejor marca real guardada para un juego, o null si no hay ninguna. */
export function bestScoreOf(scores: ScoreEntry[], gameId: string): ScoreEntry | null {
  let best: ScoreEntry | null = null;
  for (const s of scores) {
    if (s.game === gameId && (!best || s.score > best.score)) best = s;
  }
  return best;
}

type AuthContextValue = {
  user: AuthUser;
  scores: ScoreEntry[];
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

  const scores = useSyncExternalStore(
    subscribeUser,
    getScoresSnapshot,
    getServerScoresSnapshot,
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
      cachedScores = all;
      listeners.forEach((listener) => listener());
    } catch {
      // localStorage no disponible: ignorar el guardado
    }
  };

  return (
    <AuthContext.Provider value={{ user, scores, login, signOut, saveScore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
