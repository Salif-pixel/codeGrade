"use client"

import { useState } from "react"
import type { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme/button-theme"
import LanguageSwitcher from "@/components/internalization/language-switcher"
import { usePathname } from "next/navigation"
import { Link } from "@/src/i18n/navigation"
import { useTranslations } from "next-intl"
import {
    Bell,
    ChevronRight,
    LogOut,
    Search,
    Settings,
    Terminal,
    LayoutDashboard,
    ClipboardCheck,
    FileDown,
    BarChart3,
    ChevronLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignOut } from "@/src/actions/signOutactions"
import SearchDialog from "../search/search-dialog"

export default function SidebarDashboard({ user }: { user: User }) {
    const [collapsed, setCollapsed] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("dropdown-user")

    const navItems = [
        {
            title: "Tableau de bord",
            href: "/dashboard",
            icon: LayoutDashboard,
            isActive: pathname === "/dashboard",
        },
        {
            title: "Devoirs",
            href: "/assignments",
            icon: ClipboardCheck,
            badge: 3,
            isActive: pathname === "/assignments",
        },
        {
            title: "Soumissions",
            href: "/submissions",
            icon: FileDown,
            isActive: pathname === "/submissions",
        },
        {
            title: "Statistiques",
            href: "/statistics",
            icon: BarChart3,
            isActive: pathname === "/statistics",
        },
        {
            title: "Paramètres",
            href: "/settings",
            icon: Settings,
            isActive: pathname === "/settings",
        },
    ]

    return (
        <>
            <div
                className={cn(
                    "h-screen border-r bg-background flex flex-col transition-all duration-300",
                    collapsed ? "w-[70px]" : "w-[280px]",
                )}
            >
                {/* Header with logo */}
                <div className="flex h-16 items-center border-b px-4">
                    <div className="flex items-center">
                        <Terminal className="h-6 w-6 text-primary" />
                        {!collapsed && <span className="ml-2 text-xl font-bold">CodeGrade</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* User profile */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={user?.image || "/placeholder.svg?height=40&width=40"} alt={user?.name || "User"} />
                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.name || "Guest User"}</span>
                                <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user?.email || "No email"}
                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search button */}
                <div className="p-4 border-b">
                    <Button
                        variant="outline"
                        className={cn("w-full justify-start gap-2", collapsed && "px-0 justify-center")}
                        onClick={() => setSearchOpen(true)}
                    >
                        <Search className="h-4 w-4" />
                        {!collapsed && <span>Recherche...</span>}
                    </Button>
                </div>

                {/* Main navigation */}
                <div className="flex-1 overflow-auto py-2">
                    <nav className="space-y-1 px-2">
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    item.isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    collapsed && "px-2 justify-center",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("h-5 w-5", item.isActive ? "text-primary" : "text-muted-foreground")} />
                                    {!collapsed && <span>{item.title}</span>}
                                </div>
                                {!collapsed && item.badge && (
                                    <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Notifications */}
                <div className="border-t p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
                        </Button>
                        {!collapsed && <span className="text-sm font-medium">Notifications</span>}
                    </div>

                    {/* Theme and Language */}
                    <div className={cn("flex", collapsed ? "flex-col items-center gap-3" : "items-center justify-between")}>
                        <ModeToggle className="bg-background" />
                        {!collapsed && <LanguageSwitcher />}
                    </div>
                </div>

                {/* Logout */}
                <div className="border-t p-4">
                    <form action={SignOut}>
                        <Button
                            type="submit"
                            variant="outline"
                            className={cn(
                                "text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20",
                                collapsed ? "w-full px-0 justify-center" : "w-full justify-start gap-3",
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            {!collapsed && <span>Déconnexion</span>}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}

