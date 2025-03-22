"use client"

import type React from "react"

import {
    Bell,
    LogOut,
    Search,
    Settings,
    Terminal,
    User2,
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
import SearchDialog from "../search/search-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type User } from "@prisma/client"
import { ModeToggle } from "@/components/utilities/theme/button-theme"
import LanguageSwitcher from "@/components/utilities/internalization/language-switcher"
import UserDrawer from "./user-drawer"
import { useTranslations } from "next-intl"
import Navigation from "@/components/utilities/navigation/Navigation"
import {Link, useRouter} from "@/i18n/navigation";
import {authClient} from "@/lib/auth-client";

export default function HeaderDashboard({ user }: { user: User }) {
    const [searchOpen, setSearchOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const router = useRouter()
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

    const handleSignOut = async (event:any) => {
        event.preventDefault(); // Empêche le rechargement de la page
        try {
            await authClient.signOut();
            router.push('/login'); // Redirige vers la page de connexion après la déconnexion
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };
    const t = useTranslations("dropdown-user")

    return (
        <>
            <div
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-200",
                    scrolled && "shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                )}
            >
                <div className="dark:bg-zinc-900 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px]">
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
                                        <Link className={" w-full flex flex-row"} href={"/settings"}>
                                            <Settings className="mr-4 h-4 w-4" />
                                            <span >{t("settings")}</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">

                                        <form onSubmit={(e) => handleSignOut(e)}>
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                className={cn(
                                                    "text-destructive  w-full hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                )}
                                            >
                                                <LogOut className="mr-2 h-4 w-4"/>
                                                <span>{t("logout")}</span>
                                            </Button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div
                    className="border-b dark:border-zinc-700 dark:bg-zinc-900 bg-[radial-gradient(rgba(0,0,0,0.15)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:20px_20px] hidden md:block">
                    <nav className="flex w-full">
                        <div className="w-full flex justify-center item-center max-w-screen-xl mx-auto px-4">
                            <Navigation userRole={user.role}/>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    )
}

