"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Clock, Target, Zap, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTasks } from "@/hooks/use-tasks"

export function ProductivityInsights() {
  const { tasks } = useTasks()

  const completedTasks = tasks.filter((t) => t.status === "Completed").length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityCompleted = tasks.filter(
    (t) => (t.priority === "High" || t.priority === "Urgent") && t.status === "Completed",
  ).length
  const highPriorityTotal = tasks.filter((t) => t.priority === "High" || t.priority === "Urgent").length

  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed",
  ).length

  const inProgressTasks = tasks.filter((t) => t.status === "InProgress").length

  const insights = [
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description: `${completedTasks} of ${totalTasks} tasks completed`,
      icon: Target,
      trend: completionRate >= 50 ? "up" : "down",
    },
    {
      title: "Priority Focus",
      value: `${highPriorityCompleted}/${highPriorityTotal}`,
      description: "High priority tasks completed",
      icon: Zap,
      trend: highPriorityTotal === 0 || highPriorityCompleted >= highPriorityTotal / 2 ? "up" : "down",
    },
    {
      title: "In Progress",
      value: `${inProgressTasks}`,
      description: "Tasks currently being worked on",
      icon: Clock,
      trend: inProgressTasks > 0 ? "up" : "down",
    },
    {
      title: "Overdue",
      value: `${overdueTasks}`,
      description: "Tasks past their due date",
      icon: AlertTriangle,
      trend: overdueTasks === 0 ? "up" : "down",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Productivity Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <insight.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">{insight.value}</span>
                {insight.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
