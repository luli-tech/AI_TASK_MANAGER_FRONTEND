"use client";

import { useEffect } from "react";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  ListTodo,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { TaskChart } from "@/components/dashboard/task-chart";
import { TaskSuggestions } from "@/components/ai/task-suggestions";
import { useAuthStore } from "@/lib/store";
import { useTasks } from "@/hooks/use-tasks";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { tasks, isLoading } = useTasks();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const stats = {
    total: Array.isArray(tasks) ? tasks.length : 0,
    completed: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Completed").length
      : 0,
    inProgress: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "InProgress").length
      : 0,
    pending: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Pending").length
      : 0,
    overdue: Array.isArray(tasks)
      ? tasks?.filter(
          (t) =>
            t.due_date &&
            new Date(t.due_date) < new Date() &&
            t.status !== "Completed"
        ).length
      : 0,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Tasks"
                value={stats.total}
                change={`${stats.pending} pending`}
                changeType="neutral"
                icon={ListTodo}
                index={0}
              />
              <StatsCard
                title="Completed"
                value={stats.completed}
                change={`${completionRate}% completion rate`}
                changeType="positive"
                icon={CheckSquare}
                index={1}
              />
              <StatsCard
                title="In Progress"
                value={stats.inProgress}
                change="Active tasks"
                changeType="neutral"
                icon={Clock}
                index={2}
              />
              <StatsCard
                title="Overdue"
                value={stats.overdue}
                change={stats.overdue > 0 ? "Needs attention" : "All on track"}
                changeType={stats.overdue > 0 ? "negative" : "positive"}
                icon={AlertTriangle}
                index={3}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <TaskChart tasks={tasks} />
                <ActivityFeed tasks={tasks} />
              </div>
              <div className="space-y-6">
                <UpcomingDeadlines tasks={tasks} />
                <TaskSuggestions />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
