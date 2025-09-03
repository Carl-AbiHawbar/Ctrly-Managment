"use client"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import TaskViewHeader from "./task-view-header"
import TaskColumn from "./task-column"
import type { Task, TaskStatus } from "@/types/task"

// Sample data
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Redesign landing page",
    description: "Update the landing page with new branding",
    status: "todo",
    priority: "high",
    dueDate: "2023-06-15T00:00:00.000Z",
    assignees: [
      { id: "user-1", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
      { id: "user-2", name: "David Kim", avatar: "/avatars/david-kim.png" },
    ],
    project: "Website Redesign",
    attachments: 2,
    comments: 5,
    subtasks: {
      completed: 1,
      total: 3,
      items: [
        { title: "Create wireframes", completed: true },
        { title: "Design mockups", completed: false },
        { title: "Get feedback", completed: false },
      ],
    },
  },
  {
    id: "task-2",
    title: "Fix navigation bug",
    description: "The dropdown menu is not working on mobile",
    status: "in-progress",
    priority: "medium",
    dueDate: "2023-06-10T00:00:00.000Z",
    assignees: [{ id: "user-3", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" }],
    project: "Bug Fixes",
    attachments: 0,
    comments: 3,
    subtasks: {
      completed: 2,
      total: 4,
      items: [
        { title: "Identify the issue", completed: true },
        { title: "Fix the bug", completed: true },
        { title: "Test on different devices", completed: false },
        { title: "Deploy the fix", completed: false },
      ],
    },
  },
  {
    id: "task-3",
    title: "Create user onboarding flow",
    description: "Design and implement the user onboarding experience",
    status: "in-review",
    priority: "high",
    dueDate: "2023-06-20T00:00:00.000Z",
    assignees: [
      { id: "user-1", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
      { id: "user-4", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
    ],
    project: "User Experience",
    attachments: 5,
    comments: 8,
    subtasks: {
      completed: 3,
      total: 5,
      items: [
        { title: "Research best practices", completed: true },
        { title: "Create wireframes", completed: true },
        { title: "Design mockups", completed: true },
        { title: "Implement frontend", completed: false },
        { title: "Test with users", completed: false },
      ],
    },
  },
  {
    id: "task-4",
    title: "Update API documentation",
    description: "Update the API documentation with new endpoints",
    status: "done",
    priority: "low",
    dueDate: "2023-06-05T00:00:00.000Z",
    assignees: [{ id: "user-5", name: "Ryan Park", avatar: "/avatars/ryan-park.png" }],
    project: "Documentation",
    attachments: 1,
    comments: 2,
    subtasks: {
      completed: 2,
      total: 2,
      items: [
        { title: "Document new endpoints", completed: true },
        { title: "Update examples", completed: true },
      ],
    },
  },
]

export default function DashboardMyTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeView, setActiveView] = useState<string>("board")

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="flex flex-col h-full">
      <TaskViewHeader activeView={activeView} onViewChange={handleViewChange} />
      <div className="flex-1 p-3 lg:p-6">
        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-3 2xl:grid-cols-4 gap-6 h-full">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={getTasksByStatus("todo")}
              onTaskMove={handleTaskMove}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
            />
            <TaskColumn
              title="In Progress"
              status="in-progress"
              tasks={getTasksByStatus("in-progress")}
              onTaskMove={handleTaskMove}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
            />
            <TaskColumn
              title="In Review"
              status="in-review"
              tasks={getTasksByStatus("in-review")}
              onTaskMove={handleTaskMove}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={getTasksByStatus("done")}
              onTaskMove={handleTaskMove}
              onTaskCreated={handleTaskCreated}
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        </DndProvider>
      </div>
    </div>
  )
}
