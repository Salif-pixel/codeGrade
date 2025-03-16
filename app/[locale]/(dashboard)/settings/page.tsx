"use server"

import { SimpleHeaderTitle } from "@/components/dashboard/header/header-title";
import PreferencesPage from "@/components/dashboard/settings/settings-content";
import { Cog } from "lucide-react";

export default async function SettingsPage() {
  return (
    <>
      <div className="px-0 md:px-4 lg:px-8 xl:px-12 pt-10 pb-4 dark:bg-zinc-950">
        <SimpleHeaderTitle title="settings.title" Icon={<Cog className="h-5 w-5 text-primary" />} />
        <PreferencesPage />
      </div>
    </>
  )
} 