"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { Theme, useThemeValue } from "@/hooks/use-theme-store";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const theme = useThemeValue((state) => state.theme);

  useEffect(() => {
    if (theme != undefined) {
      updateTheme(theme);
    }
  }, [theme])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

const updateTheme = (newTheme?: Theme) => {
  if(document.documentElement.classList.contains("dark")){
    document.documentElement.classList.value = newTheme != "" ? `dark theme-${newTheme}` : "dark";
  }else if(document.documentElement.classList.contains("light")){
    document.documentElement.classList.value = newTheme != "" ? `light theme-${newTheme}` : "light";
  }else{
    document.documentElement.classList.value = newTheme != "" ? `theme-${newTheme}` : "";
  }
}