"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { Send, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useChat } from "@/hooks/use-chat"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function ChatWindow() {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { conversations, messages, activeConversation, sendMessage, isLoadingMessages, isSending } = useChat()
  const { user } = useAuthStore()

  const activeConv = conversations.find((c) => c.other_user_id === activeConversation)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (message.trim() && !isSending) {
      const success = await sendMessage(message.trim())
      if (success) {
        setMessage("")
      }
    }
  }

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{activeConv?.other_user_username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{activeConv?.other_user_username || "Unknown User"}</h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.id
              const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== msg.sender_id)

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}
                >
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{activeConv?.other_user_username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground",
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn("mt-1 text-xs", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </motion.div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={!message.trim() || isSending}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
