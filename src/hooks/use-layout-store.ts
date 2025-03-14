import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Layout = "top" | "side"

interface LayoutState {
  layout: Layout
  setLayout: (layout: Layout) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      layout: 'top',
      setLayout: (layout) => set({ layout: layout }),
    }),
    {
      name: 'layout-storage',
    }
  )
)

export const useLayoutValue = <T,>(selector: (state: LayoutState) => T) => {
  const store = useLayoutStore()
  const result = selector(store)
  const [data, setData] = useState<T>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}