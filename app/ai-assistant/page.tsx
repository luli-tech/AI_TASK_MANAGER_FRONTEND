"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AIAssistant } from "@/components/ai/ai-assistant"
import { ProductivityInsights } from "@/components/ai/productivity-insights"
import { useAuthStore } from "@/lib/store"

export default function AIAssistantPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <AppLayout title="AI Assistant">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AIAssistant />
        </div>
        <div>
          <ProductivityInsights />
        </div>
      </div>
    </AppLayout>
  )
}
