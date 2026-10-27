"use client";

import { useAuth, bestScoreOf } from "@/lib/auth-context";

export function PersonalBest({ gameId }: { gameId: string }) {
  const { scores } = useAuth();
  const best = bestScoreOf(scores, gameId);
  return (
    <div>
      <div className="l">Tu mejor marca</div>
      <div className="v" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
        {best ? best.score.toLocaleString("es-ES") : "—"}
      </div>
    </div>
  );
}
