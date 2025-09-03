"use client"

import { useDrag } from "react-dnd"
import {
  Calendar,
  Paperclip,
  MessageSquare,
  CheckSquare,
  MoreVertical,
  Edit,
  Trash,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task } from "@/types/task"

// Add an onClick prop to the component interface
interface TaskCardProps {
  task: Task
  onClick?: () => void
}

// Update the function signature to include the onClick prop
export default function TaskCard({ task, onClick }: TaskCardProps) {
  // Calculate progress based on completed subtasks
  const progress = task.subtasks.total > 0 ? Math.round((task.subtasks.completed / task.subtasks.total) * 100) : 0

  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  // Priority badge color
  const priorityColor = {
    low: "bg-green-100 text-green-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-red-100 text-red-800",
  }[task.priority]

  return (
    <div
      // ref={drag}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick()
      }}
    >
      <div className="p-4">
        {/* Project & Priority */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">{task.project}</span>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${priorityColor}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        {/* Task Title */}
        <h4 className="text-sm font-medium text-gray-900 mb-2">{task.title}</h4>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Task Metadata */}
        <div className="flex items-center text-xs text-gray-500 space-x-3 mb-3">
          {/* Due Date */}
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{format(new Date(task.dueDate), "MMM d")}</span>
          </div>

          {/* Attachments */}
          {task.attachments > 0 && (
            <div className="flex items-center">
              <Paperclip className="h-3.5 w-3.5 mr-1" />
              <span>{task.attachments}</span>
            </div>
          )}

          {/* Comments */}
          {task.comments > 0 && (
            <div className="flex items-center">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              <span>{task.comments}</span>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.total > 0 && (
            <div className="flex items-center">
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              <span>
                {task.subtasks.completed}/{task.subtasks.total}
              </span>
            </div>
          )}
        </div>

        {/* Assignees & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {task.assignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Task Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <MoreVertical className="h-4 w-4 text-gray-500" />
                <span className="sr-only">Task actions</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Mark as Completed</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4" />
                <span>Change Due Date</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Change Priority</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <Archive className="mr-2 h-4 w-4" />
                <span>Archive Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600">
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
