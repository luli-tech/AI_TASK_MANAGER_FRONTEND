"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { X, Calendar, Tag, Trash2, Clock, Flag, Loader2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTasks } from "@/hooks/use-tasks"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

const priorityColors: Record<TaskPriority, string> = {
  Low: "bg-green-500/10 text-green-500",
  Medium: "bg-yellow-500/10 text-yellow-500",
  High: "bg-orange-500/10 text-orange-500",
  Urgent: "bg-red-500/10 text-red-500",
}

const statusColors: Record<TaskStatus, string> = {
  Pending: "bg-blue-500/10 text-blue-500",
  InProgress: "bg-yellow-500/10 text-yellow-500",
  Completed: "bg-green-500/10 text-green-500",
  Archived: "bg-gray-500/10 text-gray-500",
}

export function TaskModal({ task, open, onClose }: TaskModalProps) {
  const { updateTask, deleteTask, isUpdating, isDeleting } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")

  if (!task) return null

  const handleSaveEdit = async () => {
    try {
      await updateTask(task.id, {
        title: editedTitle,
        description: editedDescription,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      onClose()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      await updateTask(task.id, { status })
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handlePriorityChange = async (priority: TaskPriority) => {
    try {
      await updateTask(task.id, { priority })
    } catch (error) {
      console.error("Failed to update priority:", error)
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "Completed"

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Badge className={cn(priorityColors[task.priority])}>
                  <Flag className="mr-1 h-3 w-3" />
                  {task.priority}
                </Badge>
                <Badge className={cn(statusColors[task.status])}>{task.status}</Badge>
                {isOverdue && <Badge variant="destructive">Overdue</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-xl font-bold"
                        placeholder="Task title"
                      />
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        placeholder="Task description"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} disabled={isUpdating}>
                          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer rounded-lg p-4 transition-colors hover:bg-muted/50"
                      onClick={() => {
                        setEditedTitle(task.title)
                        setEditedDescription(task.description || "")
                        setIsEditing(true)
                      }}
                    >
                      <h2 className="mb-2 text-2xl font-bold text-foreground">{task.title}</h2>
                      <p className="text-muted-foreground">{task.description || "No description. Click to add one."}</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-4 font-semibold text-foreground">Task Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-foreground">
                          {format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="text-foreground">
                          {format(new Date(task.updated_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      {task.reminder_time && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            Reminder
                          </span>
                          <span className="text-foreground">
                            {format(new Date(task.reminder_time), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Tag className="h-4 w-4" />
                      Status
                    </label>
                    <Select value={task.status} onValueChange={(value) => handleStatusChange(value as TaskStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="InProgress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Flag className="h-4 w-4" />
                      Priority
                    </label>
                    <Select
                      value={task.priority}
                      onValueChange={(value) => handlePriorityChange(value as TaskPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </label>
                    <div
                      className={cn(
                        "rounded-lg border border-border p-3 text-sm",
                        isOverdue && "border-red-500 text-red-500",
                      )}
                    >
                      {task.due_date ? format(new Date(task.due_date), "MMMM d, yyyy 'at' h:mm a") : "No deadline set"}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4" />
                      Task ID
                    </label>
                    <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground font-mono">
                      {task.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
