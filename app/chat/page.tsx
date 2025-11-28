"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatWindow } from "@/components/chat/chat-window"
import { useAuthStore } from "@/lib/store"

export default function ChatPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <AppLayout title="Chat">
      <div className="-m-6 flex h-[calc(100vh-64px)]">
        <div className="w-80 shrink-0">
          <ChatSidebar />
        </div>
        <div className="flex-1">
          <ChatWindow />
        </div>
      </div>
    </AppLayout>
  )
}
