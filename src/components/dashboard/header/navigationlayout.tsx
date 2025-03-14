"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import type { User } from "@prisma/client"
import HeaderDashboard from "./header-dashboard"
import SidebarDashboard from "./sidebar-dashboard"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"
import { useLayoutValue } from "@/hooks/use-layout-store"

export default function NavigationLayout({
                                             user,
                                             children,
                                         }: {
    user: User
    children: React.ReactNode
}) {
    const layout = useLayoutValue((state) => state.layout) as string

    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const mainRef = useRef<HTMLDivElement>(null)

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
        if (layout === "top" && headerRef.current) {
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
        } else if (layout === "side" && sidebarRef.current) {
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
    }, [layout])

    return (
        <div
            ref={containerRef}
            className={cn("flex min-h-screen bg-background", layout === "top" ? "flex-col" : "flex-row")}
        >

            {layout === "top" ? (
                <>
                    <div ref={headerRef} className="relative z-10">
                        <HeaderDashboard user={user} />
                    </div>
                    <main
                        ref={mainRef}
                        className={cn(
                            "flex-1 transition-all duration-200",
                            "py-6",
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

