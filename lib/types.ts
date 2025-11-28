// Core types for the Task Manager application - aligned with backend API

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
  is_online?: boolean
}

export interface UserResponse {
  id: string
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

// Auth types
export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

// Task types matching backend
export type TaskStatus = "Pending" | "InProgress" | "Completed" | "Archived"
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  reminder_time: string | null
  notified: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  reminder_time?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string
  reminder_time?: string
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  due_before?: string
  due_after?: string
}

// Message types
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface SendMessageRequest {
  receiver_id: string
  content: string
}

export interface Conversation {
  other_user_id: string
  other_user_username: string
  last_message: string
  last_message_time: string
  unread_count: number
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}


export interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  reminder_before_minutes: number
}

// Dashboard types
export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  overdueTasks: number
}

// Legacy types for UI compatibility
export interface Subtask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploaded_by: string
  uploaded_at: string
}

export interface Comment {
  id: string
  content: string
  author_id: string
  created_at: string
  updated_at?: string
}

export interface Activity {
  id: string
  type: "created" | "updated" | "status-changed" | "assigned" | "commented" | "attachment-added"
  description: string
  user_id: string
  created_at: string
  metadata?: Record<string, unknown>
}

// Chat types for UI
export interface Chat {
  id: string
  type: "direct" | "group"
  name?: string
  participants: string[]
  last_message?: Message
  created_at: string
  updated_at: string
}
