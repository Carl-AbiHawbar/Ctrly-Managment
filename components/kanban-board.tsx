"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { useToast } from "@/components/ui/use-toast"
import KanbanColumn from "./kanban-column"
import type { KanbanTask, KanbanStatus } from "@/types/kanban"

interface KanbanBoardProps {
  filterProject: string | null
  filterAssignee: string | null
  filterPriority: string | null
}

// Initial tasks data
const initialTasks: KanbanTask[] = [
  {
    id: "task-1",
    title: "Design System Updates",
    project: "figma",
    projectName: "Figma Design System",
    priority: "high",
    status: "backlog",
    dueDate: "2023-11-15T00:00:00.000Z",
    attachments: 3,
    comments: 5,
    subtasks: { completed: 2, total: 5 },
    description: "Update the design system with new components and styles",
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
    project: "mobile",
    projectName: "Mobile App Development",
    priority: "medium",
    status: "todo",
    dueDate: "2023-11-20T00:00:00.000Z",
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 3 },
    description: "Create wireframes for the mobile app screens",
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
    project: "static",
    projectName: "StaticMania",
    priority: "low",
    status: "in-progress",
    dueDate: "2023-11-18T00:00:00.000Z",
    attachments: 5,
    comments: 2,
    subtasks: { completed: 4, total: 4 },
    description: "Analyze user research data and create insights report",
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
    project: "static",
    projectName: "StaticMania",
    priority: "medium",
    status: "done",
    dueDate: "2023-11-10T00:00:00.000Z",
    attachments: 1,
    comments: 8,
    subtasks: { completed: 3, total: 3 },
    description: "Develop content strategy for the marketing website",
    assignees: [
      {
        id: "user-5",
        name: "David Kim",
        avatar: "/avatars/david-kim.png",
      },
    ],
  },
  {
    id: "task-5",
    title: "Component Documentation",
    project: "react",
    projectName: "Keep React",
    priority: "high",
    status: "in-review",
    dueDate: "2023-11-22T00:00:00.000Z",
    attachments: 2,
    comments: 4,
    subtasks: { completed: 2, total: 6 },
    description: "Write documentation for all React components",
    assignees: [
      {
        id: "user-1",
        name: "Alex Morgan",
        avatar: "/avatars/alex-morgan.png",
      },
      {
        id: "user-3",
        name: "Ryan Park",
        avatar: "/avatars/ryan-park.png",
      },
    ],
  },
  {
    id: "task-6",
    title: "API Integration",
    project: "mobile",
    projectName: "Mobile App Development",
    priority: "high",
    status: "in-progress",
    dueDate: "2023-11-25T00:00:00.000Z",
    attachments: 0,
    comments: 6,
    subtasks: { completed: 1, total: 4 },
    description: "Integrate the mobile app with backend APIs",
    assignees: [
      {
        id: "user-4",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
    ],
  },
  {
    id: "task-7",
    title: "User Testing",
    project: "figma",
    projectName: "Figma Design System",
    priority: "medium",
    status: "todo",
    dueDate: "2023-11-28T00:00:00.000Z",
    attachments: 1,
    comments: 2,
    subtasks: { completed: 0, total: 3 },
    description: "Conduct user testing sessions for the design system",
    assignees: [
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
    ],
  },
  {
    id: "task-8",
    title: "Analytics Dashboard",
    project: "analytics",
    projectName: "Analytics Dashboard",
    priority: "low",
    status: "backlog",
    dueDate: "2023-12-05T00:00:00.000Z",
    attachments: 0,
    comments: 1,
    subtasks: { completed: 0, total: 5 },
    description: "Design and implement the analytics dashboard",
    assignees: [
      {
        id: "user-5",
        name: "David Kim",
        avatar: "/avatars/david-kim.png",
      },
      {
        id: "user-1",
        name: "Alex Morgan",
        avatar: "/avatars/alex-morgan.png",
      },
    ],
  },
  {
    id: "task-9",
    title: "Payment Gateway Integration",
    project: "ecommerce",
    projectName: "E-commerce Platform",
    priority: "high",
    status: "in-progress",
    dueDate: "2023-11-30T00:00:00.000Z",
    attachments: 2,
    comments: 3,
    subtasks: { completed: 1, total: 2 },
    description: "Integrate payment gateway with the e-commerce platform",
    assignees: [
      {
        id: "user-4",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
    ],
  },
  {
    id: "task-10",
    title: "Product Catalog",
    project: "ecommerce",
    projectName: "E-commerce Platform",
    priority: "medium",
    status: "in-review",
    dueDate: "2023-11-20T00:00:00.000Z",
    attachments: 4,
    comments: 7,
    subtasks: { completed: 3, total: 3 },
    description: "Design and implement the product catalog",
    assignees: [
      {
        id: "user-3",
        name: "Ryan Park",
        avatar: "/avatars/ryan-park.png",
      },
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
    ],
  },
]

export default function KanbanBoard({ filterProject, filterAssignee, filterPriority }: KanbanBoardProps) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks)
  const [filteredTasks, setFilteredTasks] = useState<KanbanTask[]>(initialTasks)

  // Apply filters
  useEffect(() => {
    let filtered = [...tasks]

    if (filterProject) {
      filtered = filtered.filter((task) => task.project === filterProject)
    }

    if (filterAssignee) {
      filtered = filtered.filter((task) => task.assignees.some((assignee) => assignee.id === filterAssignee))
    }

    if (filterPriority) {
      filtered = filtered.filter((task) => task.priority === filterPriority)
    }

    setFilteredTasks(filtered)
  }, [tasks, filterProject, filterAssignee, filterPriority])

  // Handle moving a task to a different status
  const handleTaskMove = (taskId: string, newStatus: KanbanStatus) => {
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
  const handleTaskCreated = (newTask: KanbanTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask])
  }

  // Filter tasks by status
  const getTasksByStatus = (status: KanbanStatus) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <KanbanColumn
            title="Backlog"
            status="backlog"
            tasks={getTasksByStatus("backlog")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <KanbanColumn
            title="To Do"
            status="todo"
            tasks={getTasksByStatus("todo")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <KanbanColumn
            title="In Progress"
            status="in-progress"
            tasks={getTasksByStatus("in-progress")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <KanbanColumn
            title="In Review"
            status="in-review"
            tasks={getTasksByStatus("in-review")}
            onTaskMove={handleTaskMove}
            onTaskCreated={handleTaskCreated}
          />
          <KanbanColumn
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