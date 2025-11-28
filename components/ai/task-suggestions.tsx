"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2, Lightbulb, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTasks } from "@/hooks/use-tasks"

interface Suggestion {
  id: string
  type: "improvement" | "priority" | "deadline"
  title: string
  description: string
  taskId?: string
}

export function TaskSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { tasks } = useTasks()

  const generateSuggestions = async () => {
    setIsLoading(true)

    // Simulate AI suggestions based on current tasks
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newSuggestions: Suggestion[] = []

    const tasksWithoutDeadlines = tasks.filter((t) => !t.due_date && t.status !== "Completed")
    if (tasksWithoutDeadlines.length > 0) {
      newSuggestions.push({
        id: "sug-1",
        type: "deadline",
        title: "Set deadlines for tasks",
        description: `${tasksWithoutDeadlines.length} tasks don't have deadlines. Setting deadlines can help you stay on track.`,
      })
    }

    const highPriorityTasks = tasks.filter(
      (t) => (t.priority === "High" || t.priority === "Urgent") && t.status !== "Completed",
    )
    if (highPriorityTasks.length > 2) {
      newSuggestions.push({
        id: "sug-2",
        type: "priority",
        title: "Too many high-priority tasks",
        description: `You have ${highPriorityTasks.length} high-priority tasks. Consider re-evaluating priorities to focus better.`,
      })
    }

    const pendingTasks = tasks.filter((t) => t.status === "Pending")
    if (pendingTasks.length > 5) {
      newSuggestions.push({
        id: "sug-3",
        type: "improvement",
        title: "Many tasks pending",
        description: `${pendingTasks.length} tasks are pending. Consider starting some of them to make progress.`,
      })
    }

    const overdueTasks = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Completed",
    )
    if (overdueTasks.length > 0) {
      newSuggestions.push({
        id: "sug-4",
        type: "priority",
        title: "Overdue tasks need attention",
        description: `You have ${overdueTasks.length} overdue tasks. Address these first to catch up.`,
      })
    }

    // General productivity tip
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        id: "sug-5",
        type: "improvement",
        title: "Great job!",
        description: "Your tasks are well organized. Keep up the good work!",
      })
    }

    setSuggestions(newSuggestions)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Suggestions
        </CardTitle>
        <Button onClick={generateSuggestions} disabled={isLoading} size="sm">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 && !isLoading ? (
          <p className="text-center text-sm text-muted-foreground">
            Click generate to get AI-powered suggestions for your tasks
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">{suggestion.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{suggestion.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
