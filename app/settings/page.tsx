"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setEmail(data.user.email || "");
      setUserId(data.user.id);
    });
  }, [router]);

  async function handleDeleteAccount() {
    await supabase.from("notes").delete().eq("user_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Signed in as</p>
        <p className="font-medium">{email}</p>
      </div>
      <div className="mt-6 rounded-lg border border-red-200 bg-white p-4">
        <h2 className="font-semibold text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-slate-600">This permanently deletes your account and all of your notes.</p>
        <button
          onClick={handleDeleteAccount}
          className="mt-3 rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}
