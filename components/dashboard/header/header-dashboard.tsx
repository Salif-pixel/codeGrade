"use client"

import type React from "react"

import {
    Bell,
    LogOut,
    Search,
    Settings,
    Terminal,
    User2,
    LayoutDashboard,
    ClipboardCheck,
    FileDown,
    BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Link } from "@/src/i18n/navigation"
import SearchDialog from "../search/search-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { User } from "@prisma/client"
import { ModeToggle } from "@/components/theme/button-theme"
import LanguageSwitcher from "@/components/internalization/language-switcher"
import UserDrawer from "./user-drawer"
import { useTranslations } from "next-intl"

interface NavItem {
    id: string
    title: string
    href: string
    icon: React.ReactNode
    badge?: number
}

export default function HeaderDashboard({ user }: { user: User }) {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [searchOpen, setSearchOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

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

    // Add scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const t = useTranslations("dropdown-user")

    const navItems: NavItem[] = [
        {
            id: "dashboard",
            title: "Tableau de bord",
            href: "#",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            id: "assignments",
            title: "Devoirs",
            href: "#",
            icon: <ClipboardCheck className="h-4 w-4" />,
            badge: 3,
        },
        {
            id: "submissions",
            title: "Soumissions",
            href: "#",
            icon: <FileDown className="h-4 w-4" />,
        },
        {
            id: "analytics",
            title: "Statistiques",
            href: "#",
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            id: "settings",
            title: "Paramètres",
            href: "#",
            icon: <Settings className="h-4 w-4" />,
        },
    ]

    return (
        <>
            <div
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-200",
                    scrolled && "shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                )}
            >
                {/* Top Navigation Bar */}
                <div className=" dark:bg-zinc-900 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px]">
                    <div className="flex h-16 items-center px-4 md:px-6">
                        {/* Logo and Platform Name */}
                        <div className="flex items-center mr-4">
                            <div className="bg-primary/10 p-1.5 rounded-md mr-2">
                                <Terminal className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">
                CodeGrade
              </span>
                        </div>

                        {/* Search - Plus minimaliste sur mobile */}
                        <div className="ml-auto flex-1 md:flex-initial md:w-80 lg:w-96 px-4">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-full flex justify-between items-center gap-2 px-3 py-2 text-sm text-muted-foreground rounded-md border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Search className="h-4 w-4" />
                                    <span className="flex-1 text-left hidden sm:inline">{t("search")}</span>
                                </div>
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </button>
                        </div>

                        <UserDrawer user={user} />

                        {/* Right Side Icons */}
                        <div className="hidden md:flex items-center gap-2 md:gap-4 ml-4">
                            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center"
                                >
                                    3
                                </Badge>
                            </Button>

                            <div className="flex items-center gap-1 border-l pl-3 ml-1">
                                <ModeToggle className="bg-background hover:bg-muted/50" />
                                <LanguageSwitcher />
                            </div>

                            {/* User Profile */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-background">
                                            <AvatarImage src={user?.image ?? ""} alt="User" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                {user?.email?.[0]}
                                                {user?.email?.[1]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User2 className="mr-2 h-4 w-4" />
                                        <span>{t("profile")}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>{t("settings")}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{t("logout")}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b dark:bg-zinc-900 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] hidden md:block">
                    <nav className="flex w-full">
                        <div className="w-full max-w-screen-xl mx-auto px-4">
                            <div className="flex flex-col md:flex-row -mb-px">
                                {navItems.map((item) => (
                                    <Link key={item.id} className="cursor-pointer" href={item.href}>
                                        <button
                                            onClick={() => setActiveTab(item.id)}
                                            className={cn(
                                                "relative text-sm py-3 px-4 flex items-center gap-2 border-b-2 font-medium transition-all",
                                                activeTab === item.id
                                                    ? "border-primary text-primary"
                                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20",
                                            )}
                                        >
                                            {item.icon}
                                            <span>{item.title}</span>
                                            {item.badge && (
                                                <Badge
                                                    variant={activeTab === item.id ? "default" : "secondary"}
                                                    className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}

                                            {/* Active indicator dot */}
                                            {activeTab === item.id && (
                                                <span className="absolute -bottom-[1.5px] left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                            )}
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}

