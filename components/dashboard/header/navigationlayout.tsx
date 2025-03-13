"use client"

import React, {useState} from "react"
import type { User } from "@prisma/client"
import HeaderDashboard from "./header-dashboard"
import SidebarDashboard from "./sidebar-dashboard"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, PanelLeft } from "lucide-react"


type LayoutType = "header" | "sidebar"

export default function NavigationLayout({
                                             user,
                                             children,
                                         }: {
    user: User
    children: React.ReactNode
}) {
    const [layoutType, setLayoutType] = useState<LayoutType>("header")

    return (
        <div className="flex min-h-screen flex-col">
            {/* Layout Toggle Button (fixed position) */}
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-background shadow-lg border-primary/20"
                    onClick={() => setLayoutType(layoutType === "header" ? "sidebar" : "header")}
                    title={`Switch to ${layoutType === "header" ? "sidebar" : "header"} layout`}
                >
                    {layoutType === "header" ? <PanelLeft className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
                </Button>
            </div>

            {layoutType === "header" ? (
                <>
                    <HeaderDashboard user={user} />
                    <main className="flex-1">{children}</main>
                </>
            ) : (
                <div className="flex h-screen overflow-hidden">
                    <SidebarDashboard user={user} />
                    <main className="flex-1 overflow-auto p-4">{children}</main>
                </div>
            )}
        </div>
    )
}

