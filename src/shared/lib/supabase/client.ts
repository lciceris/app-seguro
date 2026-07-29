import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database-types";

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      // Já são o padrão do SDK — explicitados de propósito (ver .agents/specs/auth/requirements.md, Requirement 2).
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
