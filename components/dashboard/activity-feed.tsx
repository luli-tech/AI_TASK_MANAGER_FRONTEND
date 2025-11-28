"use client";

import type React from "react";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Circle, Archive } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";

interface ActivityFeedProps {
  tasks?: Task[];
}

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  Pending: <Circle className="h-4 w-4 text-blue-500" />,
  InProgress: <Clock className="h-4 w-4 text-yellow-500" />,
  Completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  Archived: <Archive className="h-4 w-4 text-gray-500" />,
};

export function ActivityFeed({ tasks = [] }: ActivityFeedProps) {
  const tasklist = Array.isArray(tasks) ? tasks : [];
  const recentTasks = [...tasklist]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTasks.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No recent activity
            </p>
          ) : (
            recentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">{statusIcons[task.status]}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">
                      {task.title}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated{" "}
                    {formatDistanceToNow(new Date(task.updated_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
