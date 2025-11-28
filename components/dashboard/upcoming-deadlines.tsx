"use client";

import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UpcomingDeadlinesProps {
  tasks?: Task[];
}

export function UpcomingDeadlines({ tasks = [] }: UpcomingDeadlinesProps) {
  const tasklist = Array.isArray(tasks) ? tasks : [];
  const upcomingTasks = tasklist
    .filter(
      (task) =>
        task.due_date &&
        task.status !== "Completed" &&
        task.status !== "Archived"
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTasks.map((task, index) => {
            const daysUntilDeadline = differenceInDays(
              new Date(task.due_date!),
              new Date()
            );
            const isOverdue = daysUntilDeadline < 0;
            const isUrgent = daysUntilDeadline <= 2 && !isOverdue;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {(isOverdue || isUrgent) && (
                    <AlertCircle
                      className={cn(
                        "h-4 w-4",
                        isOverdue ? "text-destructive" : "text-yellow-500"
                      )}
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(task.due_date!),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    isOverdue
                      ? "destructive"
                      : isUrgent
                      ? "secondary"
                      : "outline"
                  }
                >
                  {isOverdue
                    ? "Overdue"
                    : daysUntilDeadline === 0
                    ? "Today"
                    : daysUntilDeadline === 1
                    ? "Tomorrow"
                    : `${daysUntilDeadline} days`}
                </Badge>
              </motion.div>
            );
          })}
          {upcomingTasks.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No upcoming deadlines
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
