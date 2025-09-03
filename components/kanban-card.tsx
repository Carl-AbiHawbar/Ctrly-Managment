"use client";
import { useDrag } from "react-dnd";
import { Calendar, Paperclip, MessageSquare, CheckSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { KanbanTask } from "@/types/kanban";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import KanbanTaskDetail from "./kanban-task-detail";

interface KanbanCardProps {
  task: KanbanTask;
}

export default function KanbanCard({ task }: KanbanCardProps) {
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: "kanban-task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Priority badge color
  const priorityColor = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  }[task.priority];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          // ref={drag}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-grab ${
            isDragging ? "opacity-50" : "opacity-100"
          }`}
          style={{ opacity: isDragging ? 0.5 : 1 }}
        >
          <div className="p-3">
            {/* Project & Priority */}
            <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
              <Badge
                variant="outline"
                className="text-xs font-medium text-gray-700 bg-gray-50"
              >
                {task.projectName}
              </Badge>
              <Badge className={`text-xs font-medium border ${priorityColor}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>

            {/* Task Title */}
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {task.title}
            </h4>

            {/* Task Metadata */}
            <div className="flex flex-wrap gap-3 items-center text-xs text-gray-500 space-x-3 mb-3">
              {/* Due Date */}
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{format(new Date(task.dueDate), "MMM d")}</span>
              </div>

              {/* Attachments */}
              {task.attachments > 0 && (
                <div className="flex items-center">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachments}</span>
                </div>
              )}

              {/* Comments */}
              {task.comments > 0 && (
                <div className="flex items-center">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.comments}</span>
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.total > 0 && (
                <div className="flex items-center">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>
                    {task.subtasks.completed}/{task.subtasks.total}
                  </span>
                </div>
              )}
            </div>

            {/* Assignees */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {task.assignees.map((assignee) => (
                  <Avatar
                    key={assignee.id}
                    className="h-6 w-6 border-2 border-white"
                  >
                    <AvatarImage
                      src={assignee.avatar || "/placeholder.svg"}
                      alt={assignee.name}
                    />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.projectName}</DialogDescription>
        </DialogHeader>
        <KanbanTaskDetail task={task} />
      </DialogContent>
    </Dialog>
  );
}
