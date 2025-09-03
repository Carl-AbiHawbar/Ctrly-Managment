"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, ExternalLink } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/types/task";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskDetailModalProps) {
  const router = useRouter();
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [date, setDate] = useState<Date | undefined>(
    task ? new Date(task.dueDate) : undefined
  );

  if (!task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  const handleOpenFullTask = () => {
    router.push(`/tasks/${task.id}`);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px] flex flex-col overflow-y-auto h-[90vh]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-4 py-4 px-3">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Add a description..."
                value={editedTask.description || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date);
                        if (date) {
                          setEditedTask({
                            ...editedTask,
                            dueDate: date.toISOString(),
                          });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) =>
                    setEditedTask({
                      ...editedTask,
                      priority: value as "low" | "medium" | "high",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    status: value as
                      | "todo"
                      | "in-progress"
                      | "in-review"
                      | "done",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Subtasks</Label>
              <div className="space-y-2 border rounded-md p-3">
                {editedTask.subtasks.items?.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subtask-${index}`}
                      checked={subtask.completed}
                      onCheckedChange={(checked) => {
                        const newSubtasks = [
                          ...(editedTask.subtasks.items || []),
                        ];
                        newSubtasks[index] = {
                          ...subtask,
                          completed: checked as boolean,
                        };

                        const completedCount = newSubtasks.filter(
                          (item) => item.completed
                        ).length;

                        setEditedTask({
                          ...editedTask,
                          subtasks: {
                            ...editedTask.subtasks,
                            items: newSubtasks,
                            completed: completedCount,
                          },
                        });
                      }}
                    />
                    <Label htmlFor={`subtask-${index}`} className="text-sm">
                      {subtask.title}
                    </Label>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Add Subtask
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Assignees</Label>
              <div className="flex flex-wrap gap-2">
                {editedTask.assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={assignee.avatar || "/placeholder.svg"}
                        alt={assignee.name}
                      />
                      <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignee.name}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="rounded-full">
                  + Add
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Comments</Label>
              <div className="space-y-3 border rounded-md p-3">
                {task.comments > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/avatars/sarah-johnson.png"
                          alt="Sarah Johnson"
                        />
                        <AvatarFallback>SJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Sarah Johnson</p>
                          <span className="text-xs text-gray-500">
                            2 days ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          I've started working on this. Will update the progress
                          soon.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/avatars/david-kim.png"
                          alt="David Kim"
                        />
                        <AvatarFallback>DK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">David Kim</p>
                          <span className="text-xs text-gray-500">
                            Yesterday
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Let me know if you need any help with this task.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No comments yet
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-3">
                  <Input placeholder="Add a comment..." className="flex-1" />
                  <Button size="sm">Post</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Attachments</Label>
              <div className="border rounded-md p-3">
                {task.attachments > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded">
                          <svg
                            className="h-5 w-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            requirements.pdf
                          </p>
                          <p className="text-xs text-gray-500">
                            1.2 MB • Added 3 days ago
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-100 p-2 rounded">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">data.xlsx</p>
                          <p className="text-xs text-gray-500">
                            845 KB • Added yesterday
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No attachments
                  </p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Add Attachment
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between mt-6 pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleOpenFullTask} className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Full Task
            </Button>
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
