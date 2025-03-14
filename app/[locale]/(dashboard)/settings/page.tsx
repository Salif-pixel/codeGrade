import PreferencesPage from "@/components/dashboard/settings/settings-content";

export default function SettingsPage() {
  return (
    <>
      <div className="border-b bg-zinc-100 dark:bg-black/90 py-6 flex items-center">
        <h1 className="text-2xl font-bold ml-4 md:ml-12 lg:ml-16">Settings</h1>
      </div>
      <PreferencesPage />
    </>
  )
}