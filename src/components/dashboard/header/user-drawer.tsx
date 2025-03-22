"use client"

import { useState } from "react"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  LogOut,
  Menu,
  Settings,
  Moon,
  Globe,
  User2,
} from "lucide-react"
import { Link } from "@/i18n/navigation"
import type { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import {ModeToggle} from "@/components/utilities/theme/button-theme"
import LanguageSwitcher from "@/components/utilities/internalization/language-switcher"
import { navigationConfig } from "@/lib/nav-config"
import { useTranslations } from "next-intl"
import {authClient} from "@/lib/auth-client";
export default function UserDrawer({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
    const handleSignOut = async (event:any) => {
        event.preventDefault(); // Empêche le rechargement de la page
        try {
            await authClient.signOut();
            router.push('/login'); // Redirige vers la page de connexion après la déconnexion
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error);
        }
    };
  const navItems = navigationConfig().filter(item => item.roles.includes(user.role))
  const t = useTranslations("dropdown-user")
  return (
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] flex flex-col">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            </SheetHeader>

            {/* User Profile Section */}
            <div className="px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-3">
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
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || "Guest User"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user?.email || "No email"}
                </span>
                </div>

              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-auto py-2">
              <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">Navigation</h3>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                      <Link
                          key={item.id}
                          href={item.href}
                          className={cn(
                              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              pathname.endsWith(item.href)
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                            <Badge variant="default" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
                              {item.badge}
                            </Badge>
                        )}
                      </Link>
                  ))}
                </nav>
              </div>

              <Separator className="my-2" />

              {/* Notifications Section */}
              <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">Notifications</h3>
                <Button
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto text-sm font-medium"
                    onClick={() => {
                      router.push("/notifications")
                      setOpen(false)
                    }}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span>Notifications</span>
                  </div>
                  <Badge variant="default" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
                    3
                  </Badge>
                </Button>
              </div>

              <Separator className="my-2" />

              {/* Preferences Section */}
              <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">Préférences</h3>
                <div className="flex flex-col gap-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Thème</span>
                    </div>
                    <ModeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Langue</span>
                    </div>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="border-t p-4 mt-auto">
              <form onSubmit={(e) => handleSignOut(e)}>
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
  )
}

