"use client"

import { type ReactNode, useEffect } from "react"
import { QueryProvider } from "@/lib/query-client"
import { useUIStore } from "@/lib/store"

function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  )
}
