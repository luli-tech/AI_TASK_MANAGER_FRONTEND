"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/types";

const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"];

interface TaskChartProps {
  tasks?: Task[];
}

export function TaskChart({ tasks = [] }: TaskChartProps) {
  const statusCounts = {
    Pending: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Pending").length
      : 0,
    InProgress: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "InProgress").length
      : 0,
    Completed: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Completed").length
      : 0,
    Archived: Array.isArray(tasks)
      ? tasks.filter((t) => t.status === "Archived").length
      : 0,
  };

  const data = [
    { name: "Pending", value: statusCounts.Pending },
    { name: "In Progress", value: statusCounts.InProgress },
    { name: "Completed", value: statusCounts.Completed },
    { name: "Archived", value: statusCounts.Archived },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">No tasks to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
