"use client"

import { useState, useEffect } from "react"
import type { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/theme/button-theme"
import LanguageSwitcher from "@/components/internalization/language-switcher"
import { usePathname } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import {
    Bell,
    ChevronRight,
    LogOut,
    Search,
    Terminal,
    ChevronLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignOut } from "@/actions/signOutactions"
import SearchDialog from "../search/search-dialog"
import { navigationConfig } from "@/lib/nav-config"

export default function SidebarDashboard({ user }: { user: User }) {
    const [collapsed, setCollapsed] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations("dropdown-user")

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setSearchOpen(true)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const filteredNavigation = navigationConfig().filter((item) =>
        item.roles.includes(user.role)
    )

    return (
        <>
            <div
                className={cn(
                    "h-screen border-r bg-background  dark:bg-zinc-900 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] flex flex-col transition-all duration-300",
                    collapsed ? "w-[70px]" : "w-[280px]",
                )}
            >
                {/* Header with logo */}
                <div className="flex h-16 items-center  px-4">
                    <div className="flex items-center">
                        <Terminal className="h-6 w-6 text-primary" />
                        {!collapsed && <span className="ml-2 text-xl font-bold">CodeGrade</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto  cursor-pointer h-5 w-5" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight className="h-4 w-4 " /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>

                {/* User profile */}
                <div className="p-4 ">
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
                <div className=" flex-1 md:flex-initial px-4 p-2  border-b">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-full flex justify-between items-center gap-2 px-3 py-2 text-sm text-muted-foreground rounded-md border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Search className="h-4 w-4" />
                                    {!collapsed &&<span className="flex-1 text-left hidden sm:inline">{t("search")}</span>}
                                </div>
                                {!collapsed &&
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                 <span className="text-xs">⌘</span>K 
                                </kbd>}
                            </button>
                </div>

                {/* Main navigation */}
                <div className="flex-1 overflow-auto py-2">
                    <nav className="space-y-1 px-2">
                        {filteredNavigation.map((item) => (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    pathname.endsWith(item.href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    collapsed && "px-2 justify-center",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    {!collapsed && <span>{item.title}</span>}
                                </div>
                                {!collapsed && item.badge && (
                                    <Badge variant={pathname.endsWith(item.href) ? "default" : "secondary"} className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
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
                        <div className={cn("overflow-hidden transition-all duration-300", 
                            collapsed ? "w-0" : "w-auto"
                        )}>
                            <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                        </div>
                        <div className={cn(
                            "flex transition-all duration-300",
                            collapsed 
                                ? "opacity-0 w-0" 
                                : "opacity-100 items-center justify-between gap-3"
                        )}>
                            <ModeToggle className="bg-background" />
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Theme and Language */}
                    <div className={cn("flex", collapsed ? "flex-col items-center gap-3" : "hidden items-center justify-between")}>
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

