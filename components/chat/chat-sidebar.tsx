"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Search, Plus, MessageSquare, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useChat } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const { conversations, activeConversation, setActiveConversation, isLoadingConversations, refetchConversations } =
    useChat()

  // Fetch conversations on mount
  useEffect(() => {
    refetchConversations()
  }, [refetchConversations])

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    return conv.other_user_username.toLowerCase().includes(searchQuery.toLowerCase())
  })

  if (isLoadingConversations) {
    return (
      <div className="flex h-full items-center justify-center border-r border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <Button variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation, index) => {
            const isActive = activeConversation === conversation.other_user_id

            return (
              <motion.div
                key={conversation.other_user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setActiveConversation(conversation.other_user_id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-b border-border p-4 transition-colors hover:bg-accent",
                  isActive && "bg-accent",
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{conversation.other_user_username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{conversation.other_user_username}</span>
                    {conversation.last_message_time && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conversation.last_message_time), "h:mm a")}
                      </span>
                    )}
                  </div>
                  {conversation.last_message && (
                    <p className="truncate text-sm text-muted-foreground">{conversation.last_message}</p>
                  )}
                </div>

                {conversation.unread_count > 0 && (
                  <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {conversation.unread_count}
                  </Badge>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
