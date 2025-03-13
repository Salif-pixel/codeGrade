"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { User } from "@prisma/client"
import HeaderDashboard from "./header-dashboard"
import SidebarDashboard from "./sidebar-dashboard"
import { Button } from "@src/components/ui/button"
import { LayoutDashboard, PanelLeft } from "lucide-react"
import { gsap } from "gsap"
import { cn } from "@src/lib/utils"

type LayoutType = "header" | "sidebar"

export default function NavigationLayout({
                                             user,
                                             children,
                                         }: {
    user: User
    children: React.ReactNode
}) {
    const [layoutType, setLayoutType] = useState<LayoutType>("header")
    const [isAnimating, setIsAnimating] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)

    // Handle layout transition with GSAP
    const handleLayoutChange = (newLayout: LayoutType) => {
        if (isAnimating) return
        setIsAnimating(true)

        const timeline = gsap.timeline({
            onComplete: () => {
                setLayoutType(newLayout)
                setIsAnimating(false)
            },
        })

        // Fade out current layout with scale
        timeline.to(containerRef.current, {
            opacity: 0,
            scale: 0.98,
            duration: 0.4,
            ease: "power3.inOut",
        })
    }

    // Animation when layout changes
    useEffect(() => {
        if (!containerRef.current) return

        const timeline = gsap.timeline()

        // Common animation for container
        timeline.fromTo(
            containerRef.current,
            {
                opacity: 0,
                scale: 0.98,
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                ease: "power3.out",
            },
        )

        // Layout specific animations
        if (layoutType === "header" && headerRef.current) {
            timeline
                .fromTo(
                    headerRef.current,
                    { y: -20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
                    "-=0.3",
                )
                .fromTo(
                    mainRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
                    "-=0.3",
                )
        } else if (layoutType === "sidebar" && sidebarRef.current) {
            timeline
                .fromTo(
                    sidebarRef.current,
                    { x: -30, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
                    "-=0.3",
                )
                .fromTo(
                    mainRef.current,
                    { x: 20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
                    "-=0.3",
                )
        }
    }, [layoutType])

    return (
        <div
            ref={containerRef}
            className={cn("flex min-h-screen bg-background", layoutType === "header" ? "flex-col" : "flex-row")}
        >
            {/* Layout Toggle Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full bg-background/95 shadow-lg backdrop-blur",
                            "border border-border hover:border-border/80",
                            "transition-all duration-200 ease-in-out",
                            "hover:bg-accent hover:text-accent-foreground",
                            isAnimating && "pointer-events-none opacity-50",
                        )}
                        onClick={() => handleLayoutChange(layoutType === "header" ? "sidebar" : "header")}
                        disabled={isAnimating}
                    >
                        {layoutType === "header" ? <PanelLeft className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                    </Button>
                    {/* Tooltip */}
                    <div
                        className={cn(
                            "absolute right-full mr-2 top-1/2 -translate-y-1/2",
                            "px-2 py-1 rounded-md text-xs font-medium",
                            "bg-popover text-popover-foreground",
                            "opacity-0 translate-x-2 pointer-events-none",
                            "transition-all duration-200 ease-in-out",
                            "group-hover:opacity-100 group-hover:translate-x-0",
                        )}
                    >
                        Switch to {layoutType === "header" ? "sidebar" : "header"} layout
                    </div>
                </div>
            </div>

            {layoutType === "header" ? (
                <>
                    <div ref={headerRef} className="relative z-10">
                        <HeaderDashboard user={user} />
                    </div>
                    <main
                        ref={mainRef}
                        className={cn(
                            "flex-1 transition-all duration-200",
                            "px-4 py-6 md:px-6 lg:px-8",
                            "bg-background/50 backdrop-blur-sm",
                        )}
                    >
                        {children}
                    </main>
                </>
            ) : (
                <div className="flex h-screen w-full overflow-hidden">
                    <div ref={sidebarRef} className="relative z-10">
                        <SidebarDashboard user={user} />
                    </div>
                    <main
                        ref={mainRef}
                        className={cn(
                            "flex-1 overflow-auto transition-all duration-200",
                            "px-4 py-6 md:px-6 lg:px-8",
                            "bg-background/50 backdrop-blur-sm",
                        )}
                    >
                        {children}
                    </main>
                </div>
            )}
        </div>
    )
}

