"use client";

import { useState } from "react";
import { useDrop } from "react-dnd";
import TaskCard from "./task-card";
import TaskCreationForm from "./task-creation-form";
import TaskDetailModal from "./task-detail-modal";
import type { Task, TaskStatus } from "@/types/task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

export default function TaskColumn({
  title,
  status,
  tasks,
  onTaskMove,
  onTaskCreated,
  onTaskUpdated,
}: TaskColumnProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: "task",
    drop: (item: { id: string }) => {
      onTaskMove(item.id, status);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleSaveTask = (updatedTask: Task) => {
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask);
    }
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <>
      <div
        ref={(node) => {
          if (node) drop(node);
        }}
        className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-13rem)] ${
          isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""
        }`}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded">
              {tasks.length}
            </span>
          </div>
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

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map((task) => (
            <div key={task.id}>
              <TaskCard task={task} onClick={() => handleEditTask(task)} />
            </div>
          ))}
        </div>

        {/* Add Task Button */}
        <div className="p-3 border-t border-gray-200">
          <TaskCreationForm status={status} onTaskCreated={onTaskCreated} />
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}
    </>
  );
}
