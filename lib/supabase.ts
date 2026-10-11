import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client, needed for deleting user accounts
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
