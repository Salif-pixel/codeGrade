import PreferencesPage from "@/components/dashboard/settings/settings-content";

export default function SettingsPage() {
  return (
    <>
      <div className="border-b">
        <h1 className="text-3xl font-bold mb-6 ml-4 md:ml-12 lg:ml-16">Settings</h1>
      </div>
      <PreferencesPage />
    </>
  )
}