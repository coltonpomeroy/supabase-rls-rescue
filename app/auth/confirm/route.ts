import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for the link in the confirmation email. Supabase confirms the address,
 * then redirects here with a one-time code. The code is exchanged for a session cookie on
 * the server and the user is sent into the app.
 *
 * The exchange needs the verifier cookie set at sign-up, so it only succeeds in the
 * browser that signed up. Opened anywhere else, the email is still confirmed; the user
 * just has to log in, and the login page tells them so.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/notes", request.url));
  }

  return NextResponse.redirect(new URL("/login?notice=confirm", request.url));
}
