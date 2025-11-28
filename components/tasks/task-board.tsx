"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./task-card";
import { TaskModal } from "./task-modal";
import { CreateTaskModal } from "./create-task-modal";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/lib/types";

const columns = [
  { id: "Pending" as TaskStatus, title: "Pending", color: "bg-blue-500" },
  {
    id: "InProgress" as TaskStatus,
    title: "In Progress",
    color: "bg-yellow-500",
  },
  { id: "Completed" as TaskStatus, title: "Completed", color: "bg-green-500" },
  { id: "Archived" as TaskStatus, title: "Archived", color: "bg-gray-500" },
] as const;

export function TaskBoard() {
  const { tasks, updateStatus, isLoading } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("Pending");

  const handleDragEnd = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleCreateTask = (status: TaskStatus) => {
    setCreateStatus(status);
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const tasksList = Array.isArray(tasks) ? tasks : [];

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasksList.filter(
            (task) => task.status === column.id
          );
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${column.color}`} />
                  <h2 className="font-semibold text-foreground">
                    {column.title}
                  </h2>
                  <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCreateTask(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div
                className="flex min-h-[200px] flex-1 flex-col gap-3 rounded-xl bg-muted/30 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData("taskId");
                  if (taskId) {
                    handleDragEnd(taskId, column.id);
                  }
                }}
              >
                <AnimatePresence mode="popLayout">
                  {columnTasks.map((task, index) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("taskId", task.id)
                      }
                    >
                      <TaskCard
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        index={index}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <TaskModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <CreateTaskModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={createStatus}
      />
    </>
  );
}
