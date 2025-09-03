"use client"

import { Calendar, Paperclip, MessageSquare, Tag, Clock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { KanbanTask } from "@/types/kanban"

interface KanbanTaskDetailProps {
  task: KanbanTask
}

export default function KanbanTaskDetail({ task }: KanbanTaskDetailProps) {
  // Priority badge color
  const priorityColor = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  }[task.priority]

  // Status badge color
  const statusColor = {
    backlog: "bg-gray-100 text-gray-800 border-gray-200",
    todo: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "in-review": "bg-purple-100 text-purple-800 border-purple-200",
    done: "bg-green-100 text-green-800 border-green-200",
  }[task.status]

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge className={`font-medium border ${statusColor}`}>{formatStatus(task.status)}</Badge>
        <Badge className={`font-medium border ${priorityColor}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </Badge>
      </div>

      <div className="text-sm text-gray-700">{task.description}</div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{format(new Date(task.dueDate), "MMMM d, yyyy")}</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>October 15, 2023</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="text-sm font-medium text-gray-500 mb-2">Assignees</div>
        <div className="flex flex-wrap gap-2">
          {task.assignees.map((assignee) => (
            <div key={assignee.id} className="flex items-center bg-gray-50 rounded-full pl-1 pr-3 py-1">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-500">
            Subtasks ({task.subtasks.completed}/{task.subtasks.total})
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((task.subtasks.completed / task.subtasks.total) * 100)}%
          </div>
        </div>
        <Progress value={(task.subtasks.completed / task.subtasks.total) * 100} className="h-2" />
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        <div className="flex items-center text-sm text-gray-500">
          <Paperclip className="h-4 w-4 mr-1" />
          <span>{task.attachments} attachments</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{task.comments} comments</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Tag className="h-4 w-4 mr-1" />
          <span>{task.projectName}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Edit Task</Button>
        <Button>Complete Task</Button>
      </div>
    </div>
  )
}
