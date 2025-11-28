"use client"

import { useCallback, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useChatStore, useAuthStore } from "@/lib/store"
import { apiClient } from "@/lib/api-client"
import type { Conversation, Message, SendMessageRequest } from "@/lib/types"

export function useChat() {
  const queryClient = useQueryClient()
  const { activeConversation, setActiveConversation } = useChatStore()
  const { user } = useAuthStore()
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch conversations
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Conversation[]>("/api/messages/conversations")
      return data
    },
    staleTime: 30000,
  })

  // Fetch messages for active conversation
  const messagesQuery = useQuery({
    queryKey: ["messages", activeConversation],
    queryFn: async () => {
      if (!activeConversation) return []
      const { data } = await apiClient.get<Message[]>(`/api/messages/conversations/${activeConversation}`)
      return data
    },
    enabled: !!activeConversation,
    staleTime: 10000,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessageRequest) => {
      const { data } = await apiClient.post<Message>("/api/messages", messageData)
      return data
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(["messages", activeConversation], (old) =>
        old ? [...old, newMessage] : [newMessage],
      )
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiClient.put(`/api/messages/${messageId}/read`)
      return messageId
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData<Message[]>(["messages", activeConversation], (old) =>
        old?.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)),
      )
    },
  })

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !user) return false
      try {
        await sendMessageMutation.mutateAsync({
          receiver_id: activeConversation,
          content,
        })
        return true
      } catch {
        return false
      }
    },
    [activeConversation, user, sendMessageMutation],
  )

  const handleTyping = useCallback(() => {
    // Typing indicators would need WebSocket support
    // For now, this is a placeholder
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 2000)
  }, [])

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    conversations: conversationsQuery.data || [],
    messages: messagesQuery.data || [],
    activeConversation,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    setActiveConversation,
    sendMessage: handleSendMessage,
    handleTyping,
    markAsRead: markAsReadMutation.mutate,
    refetchConversations: conversationsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
    isSending: sendMessageMutation.isPending,
  }
}
