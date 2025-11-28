"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTaskStore } from "@/lib/store";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskFilters,
} from "@/lib/types";
import { apiClient } from "@/lib/api-client";

export function useTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient();
  const { setFilters } = useTaskStore();

  // Fetch tasks query
  const tasksQuery = useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.priority) queryParams.append("priority", filters.priority);
      if (filters?.due_before)
        queryParams.append("due_before", filters.due_before);
      if (filters?.due_after)
        queryParams.append("due_after", filters.due_after);

      const queryString = queryParams.toString();
      const url = `/api/tasks${queryString ? `?${queryString}` : ""}`;

      const { data } = await apiClient.get<Task[]>(url);
      return data;
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskRequest) => {
      const { data } = await apiClient.post<Task>("/api/tasks", taskData);
      return data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(["tasks", filters], (old) =>
        old ? [...old, newTask] : [newTask]
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update task mutation with optimistic updates
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTaskRequest;
    }) => {
      const { data } = await apiClient.put<Task>(`/api/tasks/${id}`, updates);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        filters,
      ]);

      queryClient.setQueryData<Task[]>(["tasks", filters], (old) =>
        old?.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { data } = await apiClient.patch<Task>(`/api/tasks/${id}/status`, {
        status,
      });
      return data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        filters,
      ]);

      queryClient.setQueryData<Task[]>(["tasks", filters], (old) =>
        old?.map((task) => (task.id === id ? { ...task, status } : task))
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/tasks/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        filters,
      ]);

      queryClient.setQueryData<Task[]>(["tasks", filters], (old) =>
        old?.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", filters], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: tasksQuery?.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: string, updates: UpdateTaskRequest) =>
      updateTaskMutation.mutateAsync({ id, updates }),
    updateStatus: (id: string, status: TaskStatus) =>
      updateStatusMutation.mutateAsync({ id, status }),
    deleteTask: deleteTaskMutation.mutateAsync,
    setFilters,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data } = await apiClient.get<Task>(`/api/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
}
