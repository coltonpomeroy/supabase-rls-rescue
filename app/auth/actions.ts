"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GENERIC_ERROR, type FormState } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const { email, password } = credentials(formData);
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Hand the email back so the form keeps it; never the password.
    if (error.code === "email_not_confirmed") {
      return { error: "Confirm your email first. Check your inbox for the link we sent.", email };
    }
    if (error.code === "invalid_credentials") return { error: "Incorrect email or password.", email };
    return { error: GENERIC_ERROR, email };
  }
  redirect("/notes");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const { email, password } = credentials(formData);
  if (!email) return { error: "Enter your email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters.", email };

  // Send the confirmation link back to the site the user is actually on. Supabase only
  // honours this if it matches the project's Site URL or its redirect allow-list.
  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: origin ? { emailRedirectTo: `${origin}/auth/confirm` } : undefined,
  });
  if (error) {
    if (error.code === "weak_password") return { error: "Choose a stronger password.", email };
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many sign-up emails just now. Please try again in a few minutes." };
    }
    return { error: GENERIC_ERROR };
  }
  // With email confirmation off, Supabase signs the user in straight away.
  if (data.session) redirect("/notes");

  // Same message whether or not the address already has an account, so this form cannot
  // be used to find out who is registered.
  return { message: "Check your email. We sent a link to confirm your address." };
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
