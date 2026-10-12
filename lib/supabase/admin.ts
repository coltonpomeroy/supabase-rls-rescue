import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. It bypasses Row Level Security, so it exists only on the server
 * (`server-only` fails the build if a Client Component imports this file) and is used for
 * the one thing a user's own token cannot do: delete their auth account.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
