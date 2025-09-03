"use client"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useToast } from "@/components/ui/use-toast"
import TaskColumn from "./task-column"
import type { Task, TaskStatus } from "@/types/task"

// Initial tasks data
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Design System Updates",
    project: "Figma Design System",
    priority: "high",
    status: "todo",
    dueDate: "2023-11-15T00:00:00.000Z",
    attachments: 3,
    comments: 5,
    subtasks: { completed: 2, total: 5 },
    assignees: [
      {
        id: "user-1",
        name: "Alex Morgan",
        avatar: "/avatars/alex-morgan.png",
      },
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
    ],
  },
  {
    id: "task-2",
    title: "Mobile App Wireframes",
    project: "Mobile App Development",
    priority: "medium",
    status: "in-progress",
    dueDate: "2023-11-20T00:00:00.000Z",
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 3 },
    assignees: [
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
    ],
  },
  {
    id: "task-3",
    title: "User Research Analysis",
    project: "Website Redesign",
    priority: "low",
    status: "in-review",
    dueDate: "2023-11-18T00:00:00.000Z",
    attachments: 5,
    comments: 2,
    subtasks: { completed: 4, total: 4 },
    assignees: [
      {
        id: "user-3",
        name: "Ryan Park",
        avatar: "/avatars/ryan-park.png",
      },
      {
        id: "user-4",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
    ],
  },
  {
    id: "task-4",
    title: "Content Strategy",
    project: "Marketing Campaign",
    priority: "medium",
    status: "done",
    dueDate: "2023-11-10T00:00:00.000Z",
    attachments: 1,
    comments: 8,
    subtasks: { completed: 3, total: 3 },
    assignees: [
      {
        id: "user-5",
        name: "David Kim",
        avatar: "/avatars/david-kim.png",
      },
    ],
  },
]

export default function TaskBoard() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Handle moving a task to a different status
  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          // If the task is being moved to "done", show a toast
          if (newStatus === "done" && task.status !== "done") {
            toast({
              title: "🎉 Task completed!",
              description: `"${task.title}" has been marked as complete.`,
            })
          }
          return { ...task, status: newStatus }
        }
        return task
      })
      return updatedTasks
    })
  }

  // Handle adding a new task
  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  // Filter tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={getTasksByStatus("todo")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={getTasksByStatus("in-progress")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <TaskColumn
            title="In Review"
            status="in-review"
            tasks={getTasksByStatus("in-review")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <TaskColumn
            title="Done"
            status="done"
            tasks={getTasksByStatus("done")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      </div>
    </DndProvider>
  )
}
