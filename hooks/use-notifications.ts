"use client"

import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNotificationStore } from "@/lib/store"
import { apiClient, getAccessToken, API_BASE_URL } from "@/lib/api-client"
import type { Notification, NotificationPreferences } from "@/lib/types"

export function useNotifications() {
  const queryClient = useQueryClient()
  const { subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore()

  // Fetch notifications
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get<Notification[]>("/api/notifications")
      return data
    },
    staleTime: 30000,
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/notifications/${id}/read`)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old?.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      )
    },
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notifications/${id}`)
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) => old?.filter((n) => n.id !== id))
    },
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      await apiClient.put("/api/notifications/preferences", preferences)
      return preferences
    },
  })

  // Subscribe to SSE notifications on mount
  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    let eventSource: EventSource | null = null

    const connect = () => {
      eventSource = new EventSource(`${API_BASE_URL}/api/notifications/stream`, { withCredentials: false })

      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification
          queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
            old ? [notification, ...old] : [notification],
          )
        } catch (error) {
          console.error("[SSE] Failed to parse notification:", error)
        }
      }

      eventSource.onerror = () => {
        eventSource?.close()
        // Reconnect after 5 seconds
        setTimeout(connect, 5000)
      }
    }

    // Start SSE connection
    // Note: The backend may require auth header which SSE doesn't support
    // In that case, use polling instead
    subscribeToNotifications()

    return () => {
      eventSource?.close()
      unsubscribeFromNotifications()
    }
  }, [queryClient, subscribeToNotifications, unsubscribeFromNotifications])

  const unreadCount = (notificationsQuery.data || []).filter((n) => !n.is_read).length

  return {
    notifications: notificationsQuery.data || [],
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    refetch: notificationsQuery.refetch,
  }
}
