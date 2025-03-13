"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@src/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@src/components/ui/dropdown-menu"
import {cn} from "@src/lib/utils";

export function ModeToggle({className }: { className?: string }) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className={cn(className, "cursor-pointer dark:bg-muted  hover:bg-muted dark:hover:bg-[#444]")}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    clair
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    sombre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    système
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
