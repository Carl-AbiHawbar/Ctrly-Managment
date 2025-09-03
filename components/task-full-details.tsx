"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Edit,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  CheckCircle,
  Archive,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Assignee = {
  id: string;
  name: string;
  avatar: string;
};

type Subtask = {
  id: string;
  title: string;
  completed: boolean;
};

type Subtasks = {
  total: number;
  completed: number;
  items: Subtask[];
};

type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done"; // you can expand as needed
  priority: "low" | "medium" | "high";
  dueDate: string; // ISO date string
  project: string;
  assignees: Assignee[];
  attachments: number;
  comments: number;
  subtasks: Subtasks;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

type TaskMap = {
  [taskId: string]: Task;
};

// Mock data - in a real app, you would fetch this from your API
// Record<string, Task>
const mockTasks:TaskMap = {
  "task-1": {
    id: "task-1",
    title: "Redesign the landing page",
    description:
      "Update the landing page with the new brand guidelines. Focus on improving the hero section and call-to-action buttons.",
    status: "todo",
    priority: "high",
    dueDate: "2023-06-15T00:00:00.000Z",
    project: "Website Redesign",
    assignees: [
      {
        id: "user-1",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
      {
        id: "user-2",
        name: "David Kim",
        avatar: "/avatars/david-kim.png",
      },
    ],
    attachments: 2,
    comments: 3,
    subtasks: {
      total: 4,
      completed: 1,
      items: [
        {
          id: "subtask-1",
          title: "Research competitor websites",
          completed: true,
        },
        {
          id: "subtask-2",
          title: "Create wireframes",
          completed: false,
        },
        {
          id: "subtask-3",
          title: "Design hero section",
          completed: false,
        },
        {
          id: "subtask-4",
          title: "Implement feedback from stakeholders",
          completed: false,
        },
      ],
    },
    createdAt: "2023-06-01T10:30:00.000Z",
    updatedAt: "2023-06-10T14:45:00.000Z",
  },
  "task-2": {
    id: "task-2",
    title: "Implement user authentication",
    description: "Set up user authentication using OAuth and JWT tokens.",
    status: "in-progress",
    priority: "medium",
    dueDate: "2023-06-20T00:00:00.000Z",
    project: "Backend Development",
    assignees: [
      {
        id: "user-3",
        name: "Alex Morgan",
        avatar: "/avatars/alex-morgan.png",
      },
    ],
    attachments: 1,
    comments: 2,
    subtasks: {
      total: 3,
      completed: 1,
      items: [
        {
          id: "subtask-5",
          title: "Set up OAuth provider",
          completed: true,
        },
        {
          id: "subtask-6",
          title: "Implement JWT token generation",
          completed: false,
        },
        {
          id: "subtask-7",
          title: "Create user authentication middleware",
          completed: false,
        },
      ],
    },
    createdAt: "2023-06-05T09:15:00.000Z",
    updatedAt: "2023-06-12T11:20:00.000Z",
  },
};

interface TaskFullDetailsProps {
  taskId: string;
}

export default function TaskFullDetails({ taskId }: TaskFullDetailsProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    // Simulate API fetch
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from your API
        const taskData = mockTasks[taskId];
        if (taskData) {
          setTask(taskData);
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-60 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Task Not Found</h2>
          <p className="text-gray-500 mb-6">
            The task you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/my-tasks">Go to My Tasks</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress =
    task.subtasks.total > 0
      ? Math.round((task.subtasks.completed / task.subtasks.total) * 100)
      : 0;

  // Priority badge color
  const priorityColor = {
    low: "bg-green-100 text-green-800 hover:bg-green-200",
    medium: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    high: "bg-red-100 text-red-800 hover:bg-red-200",
  }[task.priority];

  // Status badge color
  const statusColor = {
    todo: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    "in-progress": "bg-blue-100 text-blue-800 hover:bg-blue-200",
    "in-review": "bg-purple-100 text-purple-800 hover:bg-purple-200",
    done: "bg-green-100 text-green-800 hover:bg-green-200",
  }[task.status];

  const statusLabel = {
    todo: "To Do",
    "in-progress": "In Progress",
    "in-review": "In Review",
    done: "Done",
  }[task.status];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge variant="outline" className="text-sm">
            {task.project}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Mark as Completed</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Clock className="mr-2 h-4 w-4" />
                <span>Change Due Date</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <AlertTriangle className="mr-2 h-4 w-4" />
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

      {/* Main content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Task details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={`${statusColor} hover:${statusColor}`}>
                {statusLabel}
              </Badge>
              <Badge className={`${priorityColor} hover:${priorityColor}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{" "}
                Priority
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-4 w-4" />
                <span>
                  Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1.5 h-4 w-4" />
                <span>
                  Created: {format(new Date(task.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="mr-1.5 h-4 w-4" />
                <span>{task.comments} Comments</span>
              </div>
              <div className="flex items-center">
                <Paperclip className="mr-1.5 h-4 w-4" />
                <span>{task.attachments} Attachments</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Progress</h2>
              <span className="text-sm font-medium">
                {task.subtasks.completed} of {task.subtasks.total} subtasks
                completed
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="subtasks" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            {/* Subtasks Tab */}
            <TabsContent value="subtasks" className="space-y-4">
              <div className="space-y-2">
                {task.subtasks.items?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <Checkbox
                      id={subtask.id}
                      checked={subtask.completed}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={subtask.id}
                        className={`text-sm font-medium ${
                          subtask.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {subtask.title}
                      </Label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit subtask</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a new subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" disabled={!newSubtask.trim()}>
                  Add
                </Button>
              </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              {task.comments > 0 ? (
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
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
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/avatars/david-kim.png"
                        alt="David Kim"
                      />
                      <AvatarFallback>DK</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">David Kim</p>
                        <span className="text-xs text-gray-500">Yesterday</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Let me know if you need any help with this task.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/avatars/alex-morgan.png"
                        alt="Alex Morgan"
                      />
                      <AvatarFallback>AM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Alex Morgan</p>
                        <span className="text-xs text-gray-500">Just now</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        I've reviewed the requirements and have some
                        suggestions. Let's discuss in our next meeting.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}

              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src="/avatars/jessica-chen.png"
                    alt="Jessica Chen"
                  />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button size="sm" disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="space-y-4">
              {task.attachments > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <svg
                          className="h-6 w-6 text-blue-600"
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
                        <p className="text-sm font-medium">requirements.pdf</p>
                        <p className="text-xs text-gray-500">
                          1.2 MB • Added 3 days ago by Sarah Johnson
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 p-2 rounded">
                        <svg
                          className="h-6 w-6 text-green-600"
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
                          845 KB • Added yesterday by David Kim
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No attachments
                </p>
              )}

              <div className="flex justify-center">
                <Button variant="outline" className="w-full">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Upload Attachment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Assignees */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assignees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={assignee.avatar || "/placeholder.svg"}
                          alt={assignee.name}
                        />
                        <AvatarFallback>
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {assignee.name}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove assignee</span>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  + Add Assignee
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Related Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Website Redesign
                    </span>
                    <Badge variant="outline" className="text-xs">
                      In Progress
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    Create wireframes for homepage
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      Website Redesign
                    </span>
                    <Badge variant="outline" className="text-xs">
                      To Do
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    Design mobile responsive layouts
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  + Link Related Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <p>
                      <span className="font-medium">Sarah Johnson</span> created
                      this task
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <p>
                      <span className="font-medium">David Kim</span> added to
                      the task
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></div>
                  <div>
                    <p>
                      <span className="font-medium">Sarah Johnson</span> changed
                      priority to <span className="font-medium">High</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
