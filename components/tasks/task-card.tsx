"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { Calendar, Flag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Task, TaskPriority } from "@/lib/types"

interface TaskCardProps {
  task: Task
  onClick: () => void
  index: number
}

const priorityColors: Record<TaskPriority, string> = {
  Low: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Urgent: "bg-red-500/10 text-red-500 border-red-500/20",
}

const priorityIcons: Record<TaskPriority, string> = {
  Low: "text-green-500",
  Medium: "text-yellow-500",
  High: "text-orange-500",
  Urgent: "text-red-500",
}

export function TaskCard({ task, onClick, index }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "Completed"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      layout
    >
      <Card
        className={cn("cursor-pointer transition-shadow hover:shadow-lg", isOverdue && "border-red-500/50")}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="mb-3 flex items-start justify-between">
            <Badge className={cn("border", priorityColors[task.priority])}>
              <Flag className={cn("mr-1 h-3 w-3", priorityIcons[task.priority])} />
              {task.priority}
            </Badge>
            {task.notified && (
              <Badge variant="outline" className="text-xs">
                Reminded
              </Badge>
            )}
          </div>

          <h3 className="mb-2 font-semibold text-foreground line-clamp-1">{task.title}</h3>
          {task.description && <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.due_date && (
                <span className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-medium")}>
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.due_date), "MMM d")}
                </span>
              )}
            </div>

            <Badge variant="secondary" className="text-xs">
              {task.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
