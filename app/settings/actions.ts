"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { GENERIC_ERROR, type FormState } from "@/lib/form";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteAccount(): Promise<FormState> {
  // The id comes from the verified session, never from the form, so a user can only
  // ever delete themselves.
  const { supabase, user } = await requireUser();

  // Their notes go with them: notes.user_id references auth.users with ON DELETE CASCADE.
  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) return { error: GENERIC_ERROR };

  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
