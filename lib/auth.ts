import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user and a client acting as them, or a redirect to /login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
