// ===== lib/supabase.ts — cliente de Supabase (spec 04) =====

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Next inlina NEXT_PUBLIC_* solo con el nombre literal: no usar process.env[name].
export function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url)
    throw new Error("Falta la variable de entorno NEXT_PUBLIC_SUPABASE_URL");
  if (!key)
    throw new Error(
      "Falta la variable de entorno NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );

  return createClient(url, key);
}
