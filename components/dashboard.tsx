"use client";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CheckCircle,
  Clock,
  Lock,
  MoreHorizontal,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Star,
  BarChart2,
  Users,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Bell,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DonutChart } from "./donut-chart";
import { AreaChart } from "./area-chart";
import { BarChart } from "./bar-chart";
import { StatCard } from "./stat-card";
import Topbar from "./Shared/Topbar";
import Link from "next/link";

type projectT = {
  id: number;
  name: string;
  description: string;
  status: string;
  deadline: string;
  progress: number;
  tasks: number;
  activity: number;
  starred: boolean;
  team: {
    name: string;
    avatar: string;
  }[];
};

type taskGroupsT = {
  id: number;
  title: string;
  completed: boolean;
  due: string;
  status: string;
  priority: string;
  assignees: {
    name: string;
    avatar: string;
  }[];
};

const taskGroups = [
  {
    project: "Figma Design System",
    tasks: [
      {
        id: 1,
        title: "Create component documentation",
        completed: false,
        due: "Today, 2:00 PM",
        status: "today",
        priority: "high",
        assignees: [
          { name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
          { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
        ],
      },
      {
        id: 2,
        title: "Design system color palette update",
        completed: true,
        due: "Today, 10:00 AM",
        status: "today",
        priority: "medium",
        assignees: [
          { name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
        ],
      },
      {
        id: 3,
        title: "Review button component variations",
        completed: false,
        due: "Tomorrow, 11:00 AM",
        status: "tomorrow",
        priority: "medium",
        assignees: [
          { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
        ],
      },
    ],
  },
  {
    project: "Keep React",
    tasks: [
      {
        id: 4,
        title: "Fix navigation component responsive issues",
        completed: false,
        due: "Today, 4:00 PM",
        status: "today",
        priority: "high",
        assignees: [
          { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
        ],
      },
      {
        id: 5,
        title: "Implement dark mode for all components",
        completed: false,
        due: "Oct 30, 2023",
        status: "upcoming",
        priority: "low",
        assignees: [
          { name: "David Kim", avatar: "/avatars/david-kim.png" },
          { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
        ],
      },
      {
        id: 6,
        title: "Create documentation for new components",
        completed: false,
        due: "Tomorrow, 3:00 PM",
        status: "tomorrow",
        priority: "medium",
        assignees: [{ name: "Ryan Park", avatar: "/avatars/ryan-park.png" }],
      },
    ],
  },
];

const teamMembers = [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "UI/UX Designer",
    avatar: "/avatars/alex-morgan.png",
    tasks: {
      total: 18,
      running: 7,
      completed: 11,
    },
    performance: 12,
  },
  {
    id: 2,
    name: "Jessica Chen",
    email: "jessica.chen@example.com",
    role: "Frontend Developer",
    avatar: "/avatars/jessica-chen.png",
    tasks: {
      total: 24,
      running: 9,
      completed: 15,
    },
    performance: 8,
  },
  {
    id: 3,
    name: "Ryan Park",
    email: "ryan.park@example.com",
    role: "Product Manager",
    avatar: "/avatars/ryan-park.png",
    tasks: {
      total: 14,
      running: 3,
      completed: 11,
    },
    performance: 15,
  },
  {
    id: 4,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Backend Developer",
    avatar: "/avatars/sarah-johnson.png",
    tasks: {
      total: 20,
      running: 8,
      completed: 12,
    },
    performance: -3,
  },
  {
    id: 5,
    name: "David Kim",
    email: "david.kim@example.com",
    role: "QA Engineer",
    avatar: "/avatars/david-kim.png",
    tasks: {
      total: 16,
      running: 5,
      completed: 11,
    },
    performance: 6,
  },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col overflow-hidden pt-16">
        <Topbar
          name="Home"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          <div className="">
            {/* Stats Overview */}
            <section className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 xl:gap-6">
                <StatCard
                  title="Total Projects"
                  value="12"
                  change="+2"
                  changeText="from last month"
                  icon={FileText}
                  trend="up"
                />
                <StatCard
                  title="In Progress"
                  value="7"
                  change="+3"
                  changeText="from last month"
                  icon={Clock}
                  trend="up"
                />
                <StatCard
                  title="Completed"
                  value="4"
                  change="+1"
                  changeText="from last month"
                  icon={CheckCircle}
                  trend="up"
                />
                <StatCard
                  title="Overdue"
                  value="1"
                  change="-2"
                  changeText="from last month"
                  icon={AlertCircle}
                  trend="down"
                />
              </div>
            </section>

            {/* Project Overview Cards */}
            <section className="mb-8">
              <div className="flex flex-wrap gap-2 md:gap-3 items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Project Overview
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    View All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 xl:gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>

            {/* Analytics and Tasks */}
            <div className="grid grid-cols-12 gap-3 xl:gap-6 mb-8">
              {/* Analytics Section */}
              <div className="col-span-12 xl:col-span-8">
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div>
                        <CardTitle>Project Analytics</CardTitle>
                        <CardDescription>
                          Task completion and project progress over time
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            This Month
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>This Week</DropdownMenuItem>
                          <DropdownMenuItem>This Month</DropdownMenuItem>
                          <DropdownMenuItem>This Quarter</DropdownMenuItem>
                          <DropdownMenuItem>This Year</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <AreaChart />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* My Progress Analytics */}
              <div className="col-span-12 xl:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>My Progress</CardTitle>
                        <CardDescription>
                          Your task completion rate
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Export Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <DonutChart
                      data={[
                        { name: "Completed", value: 63, color: "#10b981" },
                        { name: "In Progress", value: 25, color: "#f59e0b" },
                        { name: "Not Started", value: 12, color: "#6b7280" },
                      ]}
                    />
                    <div className="grid grid-cols-3 gap-4 w-full mt-6">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          63%
                        </span>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          25%
                        </span>
                        <span className="text-xs text-gray-500">
                          In Progress
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          12%
                        </span>
                        <span className="text-xs text-gray-500">
                          Not Started
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tasks and Team Performance */}
            <div className="grid grid-cols-12  gap-3 md:gap-6 mb-8">
              <div className="col-span-12 xl:col-span-8">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>My Tasks</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/my-tasks">View All Tasks</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="today" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      </TabsList>

                      <TabsContent value="today" className="mt-0">
                        <div className="space-y-6">
                          {taskGroups.map((group) => (
                            <div key={group.project}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-500">
                                  {group.project}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {group.tasks.length} tasks
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {group.tasks
                                  .filter((task) => task.status === "today")
                                  .map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="tomorrow" className="mt-0">
                        <div className="space-y-6">
                          {taskGroups.map((group) => (
                            <div key={`${group.project}-tomorrow`}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-500">
                                  {group.project}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {
                                    group.tasks.filter(
                                      (task) => task.status === "tomorrow"
                                    ).length
                                  }{" "}
                                  tasks
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {group.tasks
                                  .filter((task) => task.status === "tomorrow")
                                  .map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="upcoming" className="mt-0">
                        <div className="space-y-6">
                          {taskGroups.map((group) => (
                            <div key={`${group.project}-upcoming`}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-500">
                                  {group.project}
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {
                                    group.tasks.filter(
                                      (task) => task.status === "upcoming"
                                    ).length
                                  }{" "}
                                  tasks
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                {group.tasks
                                  .filter((task) => task.status === "upcoming")
                                  .map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-center">
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Task
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Team Performance */}
              <div className="col-span-12 xl:col-span-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Team Performance</CardTitle>
                        <CardDescription>
                          Weekly task completion rate
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Export Data</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <BarChart />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Team Progress and Notes */}
            <div className="grid grid-cols-12 gap-3 xl:gap-6">
              <div className="col-span-12 xl:col-span-8">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                          Performance overview of team members
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">
                              Name
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">
                              Role
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500">
                              Tasks
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500">
                              Performance
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-500">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamMembers.map((member) => (
                            <tr
                              key={member.id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage
                                      src={member.avatar || "/placeholder.svg"}
                                      alt={member.name}
                                    />
                                    <AvatarFallback>
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {member.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-500 text-nowrap">
                                {member.role}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex justify-center space-x-2">
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {member.tasks.total}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                    {member.tasks.running}
                                  </span>
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {member.tasks.completed}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-nowrap">
                                <div className="flex justify-center items-center">
                                  <Badge
                                    className={cn(
                                      "font-medium",
                                      member.performance > 0
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-red-100 text-red-800 hover:bg-red-100"
                                    )}
                                  >
                                    {member.performance > 0 ? (
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                    ) : (
                                      <ArrowDownRight className="h-3 w-3 mr-1" />
                                    )}
                                    {member.performance > 0 ? "+" : ""}
                                    {member.performance}% this week
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Section */}
              <div className="col-span-12 xl:col-span-4">
                <Card>
                  <CardHeader className="pb-3 relative">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <CardTitle>Tomorrow Note</CardTitle>
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    </div>
                    <CardDescription>
                      Your personal notes for tomorrow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>
                          Team meeting at 10:00 AM with design department
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>
                          Review design system updates for Figma components
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>
                          Finalize project timeline for Keep React development
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>
                          Prepare presentation for client meeting at 2:00 PM
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>
                          Follow up with marketing team on campaign assets
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Notes
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: projectT }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 justify-between items-start">
          <div className="flex items-start space-x-2">
            <div
              className={cn(
                "w-1 h-12 rounded-full",
                project.status === "In Progress" && "bg-yellow-500",
                project.status === "Completed" && "bg-green-500",
                project.status === "Planning" && "bg-blue-500"
              )}
            />
            <div>
              <CardTitle className="text-lg flex items-center">
                {project.name}
                {project.starred && (
                  <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
                )}
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
          </div>
          <Badge
            className={cn(
              "font-medium text-nowrap",
              project.status === "In Progress" &&
                "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
              project.status === "Completed" &&
                "bg-green-100 text-green-800 hover:bg-green-100",
              project.status === "Planning" &&
                "bg-blue-100 text-blue-800 hover:bg-blue-100"
            )}
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Deadline: {project.deadline}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex -space-x-2">
            {project.team.map((member, index) => (
              <Avatar key={index} className="h-8 w-8 border-2 border-white">
                <AvatarImage
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" />
              <span>{project.tasks} tasks</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              <span>{project.activity} activities</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Task Item Component
function TaskItem({ task }: { task: taskGroupsT }) {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
      <div className="flex items-center">
        <Checkbox
          id={`task-${task.id}`}
          className="mr-3"
          defaultChecked={task.completed}
        />
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "font-medium text-gray-900",
              task.completed && "line-through text-gray-500"
            )}
          >
            {task.title}
          </label>
          <div className="flex flex-wrap gap-2 items-center mt-1">
            {task.due && (
              <div className="flex items-center text-xs mr-3">
                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                <span
                  className={cn(
                    task.status === "overdue" && "text-red-600",
                    task.status === "today" && "text-blue-600",
                    task.status === "tomorrow" && "text-yellow-600",
                    task.status === "upcoming" && "text-gray-500"
                  )}
                >
                  {task.due}
                </span>
              </div>
            )}
            {task.priority && (
              <Badge
                className={cn(
                  "text-xs",
                  task.priority === "high" &&
                    "bg-red-100 text-red-800 hover:bg-red-100",
                  task.priority === "medium" &&
                    "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                  task.priority === "low" &&
                    "bg-green-100 text-green-800 hover:bg-green-100"
                )}
              >
                {task.priority}
              </Badge>
            )}
            {task.completed && (
              <div className="flex items-center text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.map((assignee, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                <AvatarImage
                  src={assignee.avatar || "/placeholder.svg"}
                  alt={assignee.name}
                />
                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper Functions
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

// Sample Data
const projects = [
  {
    id: 1,
    name: "Figma Design System",
    description: "UI component library for design system",
    status: "In Progress",
    deadline: "Nov 15, 2023",
    progress: 65,
    tasks: 24,
    activity: 128,
    starred: true,
    team: [
      { name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
      { name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
    ],
  },
  {
    id: 2,
    name: "Keep React",
    description: "React component library development",
    status: "Planning",
    deadline: "Dec 5, 2023",
    progress: 25,
    tasks: 18,
    activity: 86,
    starred: false,
    team: [
      { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
      { name: "David Kim", avatar: "/avatars/david-kim.png" },
      { name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
    ],
  },
  {
    id: 3,
    name: "StaticMania",
    description: "Marketing website redesign project",
    status: "Completed",
    deadline: "Oct 25, 2023",
    progress: 100,
    tasks: 32,
    activity: 214,
    starred: true,
    team: [
      { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
      { name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
      { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
    ],
  },
];
