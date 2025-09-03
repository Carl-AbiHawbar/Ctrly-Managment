"use client";

import { useDrop } from "react-dnd";
import KanbanCard from "./kanban-card";
import KanbanTaskForm from "./kanban-task-form";
import type { KanbanTask, KanbanStatus } from "@/types/kanban";
import { MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface KanbanColumnProps {
  title: string;
  status: KanbanStatus;
  tasks: KanbanTask[];
  onTaskMove: (taskId: string, newStatus: KanbanStatus) => void;
  onTaskCreated: (task: KanbanTask) => void;
}

export default function KanbanColumn({
  title,
  status,
  tasks,
  onTaskMove,
  onTaskCreated,
}: KanbanColumnProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: "kanban-task",
    drop: (item: { id: string }) => {
      onTaskMove(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Get column color based on status
  const getColumnColor = () => {
    switch (status) {
      case "backlog":
        return "bg-gray-100";
      case "todo":
        return "bg-blue-50";
      case "in-progress":
        return "bg-yellow-50";
      case "in-review":
        return "bg-purple-50";
      case "done":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div
      ref={(node) => {
        if (node) drop(node);
      }}
      className={`rounded-lg border border-gray-200 flex flex-col h-[calc(100vh-13rem)] ${
        isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""
      } ${getColumnColor()}`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <span className="ml-2 bg-white text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
              {tasks.length}
            </span>
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
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Move</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-gray-300 rounded-lg bg-white bg-opacity-50">
            <p className="text-sm text-gray-500">No tasks</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700 hover:bg-white justify-start"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg ">
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>

            <KanbanTaskForm
              status={status}
              onTaskCreated={(task) => {
                onTaskCreated(task);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}