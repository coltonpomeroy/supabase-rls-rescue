import RescueGuide from "@/components/RescueGuide";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const { user } = await requireUser();

  return (
    <div>
      <RescueGuide page="settings" />
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Signed in as</p>
        <p className="font-medium">{user.is_anonymous ? "Demo account" : user.email}</p>
        {user.is_anonymous && (
          <p className="mt-1 text-sm text-slate-600">
            A temporary account with no email. Its notes are only reachable from this browser.
          </p>
        )}
      </div>
      <div className="mt-6 rounded-lg border border-red-200 bg-white p-4">
        <h2 className="font-semibold text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-slate-600">This permanently deletes your account and all of your notes.</p>
        <DeleteAccountForm />
      </div>
    </div>
  );
}
