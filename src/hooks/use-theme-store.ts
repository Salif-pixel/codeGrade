import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = "" | "amber" | "obsidian"

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: '',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
)

// Hydration helper
export const useThemeValue = <T,>(selector: (state: ThemeState) => T) => {
  const store = useThemeStore()
  const result = selector(store)
  const [data, setData] = useState<T>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}