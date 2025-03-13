"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserIcon,
  ClipboardCheck,
  FileDown,
  BarChart3,
  Moon,
  Globe,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import type { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { SignOut } from "@/src/actions/signOutactions"
import {ModeToggle} from "@/components/theme/button-theme";
import LanguageSwitcher from "@/components/internalization/language-switcher";


interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
  isActive?: boolean
}

export default function UserDrawer({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navItems: NavItem[] = [
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
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user?.image || "/placeholder.svg?height=40&width=40"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || "Guest User"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {user?.email || "No email"}
                </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-full">
                      <UserIcon className="h-4 w-4" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={() => {
                          router.push("/profile")
                          setOpen(false)
                        }}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => {
                          router.push("/settings")
                          setOpen(false)
                        }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setOpen(false)}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-auto py-2">
              <div className="px-3 py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">Navigation</h3>
                <nav className="space-y-1">
                  {navItems.map((item, index) => (
                      <Link
                          key={index}
                          href={item.href}
                          className={cn(
                              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              item.isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn("h-4 w-4", item.isActive ? "text-primary" : "text-muted-foreground")} />
                          <span>{item.title}</span>
                        </div>
                        {item.badge ? (
                            <Badge variant="default" className="ml-auto h-5 min-w-5 px-1 flex items-center justify-center">
                              {item.badge}
                            </Badge>
                        ) : item.isActive ? (
                            <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                        ) : null}
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
              <form action={SignOut}>
                <Button
                    type="submit"
                    variant="outline"
                    className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
  )
}

