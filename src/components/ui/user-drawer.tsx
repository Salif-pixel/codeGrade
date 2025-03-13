"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  PieChart,
  Settings,
  User,
} from "lucide-react"

export default function UserDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          {/* User Profile Header */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Jean Dupont</span>
                <span className="text-xs text-muted-foreground">jean.dupont@example.com</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                    <User className="h-4 w-4" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpen(false)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpen(false)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => setOpen(false)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Separator />

          {/* Main Navigation - Compact */}
          <div className="p-2">
            <nav className="grid gap-1">
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <PieChart className="h-4 w-4" />
                <span>Analytics</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <FileText className="h-4 w-4" />
                <span>Documents</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 h-9" onClick={() => setOpen(false)}>
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </Button>
            </nav>
          </div>

          <Separator className="mt-2" />

          {/* Settings and Help */}
          <div className="p-2">
            <nav className="grid gap-1">
              <Button variant="ghost" className="w-full justify-start gap-3 h-10 font-normal hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-10 font-normal hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
              </Button>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-2 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setOpen(false)}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}