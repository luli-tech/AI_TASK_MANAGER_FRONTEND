import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  User,
  UserResponse,
  Task,
  Notification,
  Message,
  Conversation,
  AuthTokens,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskFilters,
  SendMessageRequest,
} from "./types"
import { apiClient, setTokens, clearTokens, getAccessToken, API_BASE_URL } from "./api-client"

// Auth State
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => void
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await apiClient.post<AuthTokens & { user: UserResponse }>(
            "/api/auth/login",
            { email, password },
            { skipAuth: true },
          )

          setTokens(data.access_token, data.refresh_token)

          const user: User = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role as "user" | "admin",
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            is_online: true,
          }

          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login failed"
          set({ error: message, isLoading: false })
          return false
        }
      },

      loginWithGoogle: () => {
        // Redirect to Google OAuth endpoint
        window.location.href = `${API_BASE_URL}/api/auth/google`
      },

      signup: async (username: string, email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await apiClient.post<AuthTokens & { user: UserResponse }>(
            "/api/auth/register",
            { username, email, password },
            { skipAuth: true },
          )

          setTokens(data.access_token, data.refresh_token)

          const user: User = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role as "user" | "admin",
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            is_online: true,
          }

          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : "Registration failed"
          set({ error: message, isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await apiClient.post("/api/auth/logout")
        } catch (error) {
          console.error("[Auth] Logout error:", error)
        } finally {
          clearTokens()
          set({ user: null, isAuthenticated: false })
          apiClient.clearCache()
        }
      },

      refreshToken: async () => {
        try {
          const { data } = await apiClient.post<AuthTokens>("/api/auth/refresh")
          setTokens(data.access_token, data.refresh_token)
          return true
        } catch {
          clearTokens()
          set({ user: null, isAuthenticated: false })
          return false
        }
      },

      checkAuth: async () => {
        const token = getAccessToken()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return
        }

        // If we have stored user data, consider authenticated
        const state = get()
        if (state.user) {
          set({ isAuthenticated: true })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

// Task State
interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filters: TaskFilters
  fetchTasks: (filters?: TaskFilters) => Promise<void>
  createTask: (task: CreateTaskRequest) => Promise<Task | null>
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>
  setFilters: (filters: TaskFilters) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null })
    try {
      const queryParams = new URLSearchParams()
      const activeFilters = filters || get().filters

      if (activeFilters.status) queryParams.append("status", activeFilters.status)
      if (activeFilters.priority) queryParams.append("priority", activeFilters.priority)
      if (activeFilters.due_before) queryParams.append("due_before", activeFilters.due_before)
      if (activeFilters.due_after) queryParams.append("due_after", activeFilters.due_after)

      const queryString = queryParams.toString()
      const url = `/api/tasks${queryString ? `?${queryString}` : ""}`

      const { data } = await apiClient.get<Task[]>(url)
      set({ tasks: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch tasks"
      set({ error: message, isLoading: false })
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiClient.post<Task>("/api/tasks", taskData)
      set((state) => ({ tasks: [...state.tasks, data], isLoading: false }))
      apiClient.invalidateCache("/api/tasks")
      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create task"
      set({ error: message, isLoading: false })
      return null
    }
  },

  updateTask: async (id: string, updates: UpdateTaskRequest) => {
    set({ error: null })
    try {
      const { data } = await apiClient.put<Task>(`/api/tasks/${id}`, updates)
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
      }))
      apiClient.invalidateCache("/api/tasks")
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update task"
      set({ error: message })
      return false
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null })
    try {
      await apiClient.delete(`/api/tasks/${id}`)
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }))
      apiClient.invalidateCache("/api/tasks")
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete task"
      set({ error: message })
      return false
    }
  },

  updateTaskStatus: async (id: string, status: TaskStatus) => {
    set({ error: null })
    try {
      const { data } = await apiClient.patch<Task>(`/api/tasks/${id}/status`, { status })
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
      }))
      apiClient.invalidateCache("/api/tasks")
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update task status"
      set({ error: message })
      return false
    }
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters })
    get().fetchTasks(filters)
  },

  clearError: () => set({ error: null }),
}))

// Message/Chat State
interface ChatState {
  conversations: Conversation[]
  messages: Message[]
  activeConversation: string | null
  isLoading: boolean
  error: string | null
  fetchConversations: () => Promise<void>
  fetchMessages: (otherUserId: string) => Promise<void>
  sendMessage: (data: SendMessageRequest) => Promise<boolean>
  markAsRead: (messageId: string) => Promise<boolean>
  setActiveConversation: (userId: string | null) => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiClient.get<Conversation[]>("/api/messages/conversations")
      set({ conversations: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch conversations"
      set({ error: message, isLoading: false })
    }
  },

  fetchMessages: async (otherUserId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiClient.get<Message[]>(`/api/messages/conversations/${otherUserId}`)
      set({ messages: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch messages"
      set({ error: message, isLoading: false })
    }
  },

  sendMessage: async (messageData: SendMessageRequest) => {
    set({ error: null })
    try {
      const { data } = await apiClient.post<Message>("/api/messages", messageData)
      set((state) => ({ messages: [...state.messages, data] }))
      // Refresh conversations to update last message
      get().fetchConversations()
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message"
      set({ error: message })
      return false
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      await apiClient.put(`/api/messages/${messageId}/read`)
      set((state) => ({
        messages: state.messages.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg)),
      }))
      return true
    } catch {
      return false
    }
  },

  setActiveConversation: (userId: string | null) => {
    set({ activeConversation: userId, messages: [] })
    if (userId) {
      get().fetchMessages(userId)
    }
  },

  clearError: () => set({ error: null }),
}))

// Notification State
interface NotificationState {
  notifications: Notification[]
  isLoading: boolean
  error: string | null
  eventSource: EventSource | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<boolean>
  deleteNotification: (id: string) => Promise<boolean>
  subscribeToNotifications: () => void
  unsubscribeFromNotifications: () => void
  clearError: () => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  eventSource: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await apiClient.get<Notification[]>("/api/notifications")
      set({ notifications: data, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch notifications"
      set({ error: message, isLoading: false })
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      }))
      return true
    } catch {
      return false
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await apiClient.delete(`/api/notifications/${id}`)
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
      return true
    } catch {
      return false
    }
  },

  subscribeToNotifications: () => {
    const token = getAccessToken()
    if (!token) return

    // Close existing connection
    get().unsubscribeFromNotifications()

    const eventSource = new EventSource(`${API_BASE_URL}/api/notifications/stream?token=${token}`)

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification
        set((state) => ({
          notifications: [notification, ...state.notifications],
        }))
      } catch (error) {
        console.error("[SSE] Failed to parse notification:", error)
      }
    }

    eventSource.onerror = () => {
      console.error("[SSE] Connection error")
      eventSource.close()
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        if (getAccessToken()) {
          get().subscribeToNotifications()
        }
      }, 5000)
    }

    set({ eventSource })
  },

  unsubscribeFromNotifications: () => {
    const { eventSource } = get()
    if (eventSource) {
      eventSource.close()
      set({ eventSource: null })
    }
  },

  clearError: () => set({ error: null }),
}))

// UI State
interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark"
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark") => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "dark",
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "ui-storage" },
  ),
)
