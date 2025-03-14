"use client";

import NextTopLoader from "nextjs-toploader";
import { useThemeValue } from "@/hooks/use-theme-store";

export default function TopLoader() {
    const theme: string = useThemeValue((state) => state.theme) as string
    const color = theme == "obsidian" ? "#7c3aed" : theme == "amber" ? "#f69f0a" : "#64e5bf";

    return (
        <>
            <NextTopLoader showSpinner={false} color={color} />
        </>
    )
}
