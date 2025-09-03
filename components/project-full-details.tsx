"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Star,
  FileText,
  Users,
  BarChart2,
  Settings,
  MessageSquare,
  CheckSquare,
  Plus,
  Download,
  Share2,
  Edit,
  Trash2,
  PlusCircle,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Paperclip,
  Link2,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar";
import Topbar from "./Shared/Topbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import KanbanTaskForm from "./kanban-task-form";
import { AreaChart } from "./area-chart";
import { DonutChart } from "./donut-chart";
import { BarChart } from "./bar-chart";
import DashboardMyTasks from "./dashboard-my-tasks";

interface Project {
  id: number;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  deadline: string;
  progress: number;
  tasks: number;
  activity: number;
  starred: boolean;
  team: {
    name: string;
    avatar: string;
  }[];
  priority: "Low" | "Medium" | "High";
  client: string;
  budget: string;
  startDate: string;
}

interface ProjectFullDetailsProps {
  projectId: string;
}

export default function ProjectFullDetails({
  projectId,
}: ProjectFullDetailsProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch project details
    const fetchProject = async () => {
      setLoading(true);
      // In a real app, you would fetch from an API
      const foundProject = sampleProjects.find(
        (p) => p.id === Number.parseInt(projectId)
      );

      if (foundProject) {
        setProject(foundProject);
      } else {
        // Handle not found
        router.push("/projects");
      }

      setLoading(false);
    };

    fetchProject();
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null; // Router will redirect
  }

  return (
    <div className=" bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar
          name="Project Details"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={cn(
                    "w-2 h-16 rounded-full",
                    project.status === "In Progress" && "bg-yellow-500",
                    project.status === "Completed" && "bg-green-500",
                    project.status === "Planning" && "bg-blue-500",
                    project.status === "On Hold" && "bg-gray-500"
                  )}
                />
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {project.name}
                    </h1>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => console.log("Toggle star")}
                    >
                      <Star
                        className={cn(
                          "h-5 w-5",
                          project.starred
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-400"
                        )}
                      />
                      <span className="sr-only">
                        {project.starred ? "Unstar" : "Star"} project
                      </span>
                    </Button>
                  </div>
                  <p className="text-gray-500 mt-1">{project.description}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge
                      className={cn(
                        "font-medium",
                        project.status === "In Progress" &&
                          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                        project.status === "Completed" &&
                          "bg-green-100 text-green-800 hover:bg-green-100",
                        project.status === "Planning" &&
                          "bg-blue-100 text-blue-800 hover:bg-blue-100",
                        project.status === "On Hold" &&
                          "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      )}
                    >
                      {project.status}
                    </Badge>
                    <Badge
                      className={cn(
                        "font-medium",
                        project.priority === "High" &&
                          "bg-red-100 text-red-800 hover:bg-red-100",
                        project.priority === "Medium" &&
                          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                        project.priority === "Low" &&
                          "bg-green-100 text-green-800 hover:bg-green-100"
                      )}
                    >
                      {project.priority} Priority
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Deadline: {project.deadline}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Started: {project.startDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Progress</div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-bold">{project.progress}%</div>
                  <div className="text-xs text-gray-500">
                    {project.tasks} tasks (
                    {Math.round((project.progress / 100) * project.tasks)}{" "}
                    completed)
                  </div>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Budget</div>
                <div className="text-xl font-bold">{project.budget}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Client: {project.client}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Team</div>
                <div className="flex -space-x-2 mb-2">
                  {project.team.map((member, index) => (
                    <Avatar
                      key={index}
                      className="h-8 w-8 border-2 border-white"
                    >
                      <AvatarImage
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {project.team.length} team members
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Activity</div>
                <div className="text-xl font-bold">{project.activity}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Last updated: Today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Content */}
        <main className=" flex-1 container mx-auto px-4 py-6">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="flex flex-wrap gap-1 justify-start h-full md:w-max mb-6">
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="team">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Description</CardTitle>
                      <CardDescription>
                        Detailed information about the project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        This is a comprehensive project aimed at{" "}
                        {project.description.toLowerCase()}. The project
                        involves multiple phases including research, design,
                        development, testing, and deployment.
                      </p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Project Goals
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Create a comprehensive design system</li>
                            <li>Implement responsive components</li>
                            <li>Ensure accessibility compliance</li>
                            <li>Develop documentation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Key Deliverables
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li>Component library</li>
                            <li>Style guide</li>
                            <li>Implementation examples</li>
                            <li>Technical documentation</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Project Timeline</CardTitle>
                      <CardDescription>
                        Key milestones and deadlines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                          <div className="mb-1">
                            <span className="text-sm font-medium">
                              Project Kickoff
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {project.startDate}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Initial project setup, team assignment, and
                            requirements gathering.
                          </p>
                        </div>

                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                          <div className="mb-1">
                            <span className="text-sm font-medium">
                              Design Phase Completed
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              Oct 15, 2023
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Finalized wireframes, mockups, and design
                            specifications.
                          </p>
                        </div>

                        <div className="relative pl-8 pb-6 border-l-2 border-gray-200">
                          <div
                            className={cn(
                              "absolute left-[-8px] top-0 w-4 h-4 rounded-full",
                              project.status === "In Progress"
                                ? "bg-yellow-500"
                                : "bg-gray-300"
                            )}
                          ></div>
                          <div className="mb-1">
                            <span className="text-sm font-medium">
                              Development Milestone
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              Nov 5, 2023
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Core functionality implementation and initial
                            testing.
                          </p>
                        </div>

                        <div className="relative pl-8 pb-0">
                          <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-gray-300"></div>
                          <div className="mb-1">
                            <span className="text-sm font-medium">
                              Project Completion
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {project.deadline}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Final testing, documentation, and client handover.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Client
                          </h4>
                          <p className="text-sm">{project.client}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Budget
                          </h4>
                          <p className="text-sm">{project.budget}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Start Date
                          </h4>
                          <p className="text-sm">{project.startDate}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Deadline
                          </h4>
                          <p className="text-sm">{project.deadline}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Project Manager
                          </h4>
                          <div className="flex items-center mt-1">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src={
                                  project.team[0].avatar || "/placeholder.svg"
                                }
                                alt={project.team[0].name}
                              />
                              <AvatarFallback>
                                {getInitials(project.team[0].name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {project.team[0].name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              Jessica Chen updated the design files
                            </p>
                            <p className="text-xs text-gray-500">
                              Today at 10:30 AM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/alex-morgan.png"
                              alt="Alex Morgan"
                            />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              Alex Morgan completed 3 tasks
                            </p>
                            <p className="text-xs text-gray-500">
                              Yesterday at 4:15 PM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/ryan-park.png"
                              alt="Ryan Park"
                            />
                            <AvatarFallback>RP</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              Ryan Park added new comments
                            </p>
                            <p className="text-xs text-gray-500">
                              Yesterday at 2:30 PM
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-4">
                        View All Activity
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">
                              project-requirements.pdf
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">design-mockups.fig</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="text-sm">
                              project-timeline.xlsx
                            </span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Add Attachment
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              {/* <div className="flex justify-end mb-6">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div> */}

              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <span>To Do</span>
                      <Badge className="ml-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
                        3
                      </Badge>
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <Card className="border-l-4 border-l-gray-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Implement responsive design for mobile
                        </h4>
                        <Badge variant="outline">UI</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Ensure the application works well on all mobile devices.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Nov 10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-gray-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Create documentation for API endpoints
                        </h4>
                        <Badge variant="outline">Docs</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Document all API endpoints with examples and response
                        formats.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/ryan-park.png"
                              alt="Ryan Park"
                            />
                            <AvatarFallback>RP</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Nov 12</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-gray-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Set up automated testing pipeline
                        </h4>
                        <Badge variant="outline">DevOps</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Configure CI/CD pipeline for automated testing on each
                        commit.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/david-kim.png"
                              alt="David Kim"
                            />
                            <AvatarFallback>DK</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Nov 15</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

               
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <span>In Progress</span>
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        2
                      </Badge>
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Implement authentication system
                        </h4>
                        <Badge variant="outline">Backend</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Set up user authentication with JWT and role-based
                        access control.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/alex-morgan.png"
                              alt="Alex Morgan"
                            />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Nov 8</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Design dashboard components
                        </h4>
                        <Badge variant="outline">Design</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Create UI components for the analytics dashboard.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Nov 7</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

            
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700 flex items-center">
                      <span>Completed</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                        4
                      </Badge>
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Create project wireframes
                        </h4>
                        <Badge variant="outline">Design</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Develop initial wireframes for all main screens.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          <span>Oct 25</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          Set up project repository
                        </h4>
                        <Badge variant="outline">DevOps</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Initialize Git repository and set up branch protection
                        rules.
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src="/avatars/david-kim.png"
                              alt="David Kim"
                            />
                            <AvatarFallback>DK</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          <span>Oct 18</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div> */}

              <DashboardMyTasks />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Team Members</h2>
                  <p className="text-gray-500">
                    Manage team members and their roles
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team Member
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">
                            Name
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">
                            Tasks
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.team.map((member, index) => (
                          <tr
                            key={index}
                            className="border-b last:border-0 hover:bg-gray-50"
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
                                  <div className="font-medium">
                                    {member.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {index === 0
                                      ? "alex@example.com"
                                      : index === 1
                                      ? "jessica@example.com"
                                      : "ryan@example.com"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">
                                {index === 0
                                  ? "Project Manager"
                                  : index === 1
                                  ? "UI/UX Designer"
                                  : "Frontend Developer"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="font-medium mr-2">
                                  {index === 0 ? "8" : index === 1 ? "12" : "6"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({index === 0 ? "5" : index === 1 ? "7" : "3"}{" "}
                                  completed)
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={cn(
                                  "font-medium",
                                  index === 0
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                )}
                              >
                                {index === 0 ? "Active" : "Active"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Discussions</h2>
                  <p className="text-gray-500">
                    Project discussions and comments
                  </p>
                </div>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Discussion
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Design System Components</CardTitle>
                          <CardDescription>
                            Started by Jessica Chen • 3 days ago
                          </CardDescription>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">Jessica Chen</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                3 days ago
                              </span>
                            </div>
                            <div className="mt-2 text-gray-700">
                              <p>
                                I've updated the design files with the latest
                                component changes. The new button styles and
                                form elements are now consistent across all
                                screens. Please review when you get a chance.
                              </p>
                              <p className="mt-2">
                                Also, I'm thinking we should standardize our
                                color palette a bit more. There are some
                                inconsistencies in the shades we're using.
                              </p>
                            </div>
                            <div className="mt-3 flex items-center space-x-4">
                              <Button variant="ghost" size="sm" className="h-8">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarImage
                              src="/avatars/alex-morgan.png"
                              alt="Alex Morgan"
                            />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">Alex Morgan</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                2 days ago
                              </span>
                            </div>
                            <div className="mt-2 text-gray-700">
                              <p>
                                Thanks for the update, Jessica! I've reviewed
                                the changes and they look great. I agree about
                                the color palette - let's schedule a quick
                                meeting to finalize the colors.
                              </p>
                            </div>
                            <div className="mt-3 flex items-center space-x-4">
                              <Button variant="ghost" size="sm" className="h-8">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarImage
                              src="/avatars/ryan-park.png"
                              alt="Ryan Park"
                            />
                            <AvatarFallback>RP</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">Ryan Park</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs text-gray-500">
                                1 day ago
                              </span>
                            </div>
                            <div className="mt-2 text-gray-700">
                              <p>
                                I've started implementing the new components in
                                the codebase. The button and form components are
                                now updated. I'll work on the navigation
                                elements next.
                              </p>
                            </div>
                            <div className="mt-3 flex items-center space-x-4">
                              <Button variant="ghost" size="sm" className="h-8">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Link2 className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarImage
                              src="/avatars/alex-morgan.png"
                              alt="Alex Morgan"
                            />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <textarea
                              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Write a reply..."
                              rows={3}
                            ></textarea>
                            <div className="mt-3 flex justify-end">
                              <Button>Post Reply</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Discussions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                          <h4 className="font-medium">
                            Design System Components
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>Started by Jessica Chen</span>
                            <span className="mx-2">•</span>
                            <span>3 days ago</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                              Active
                            </Badge>
                            <span className="text-xs text-gray-500">
                              3 replies
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                          <h4 className="font-medium">
                            API Integration Issues
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>Started by David Kim</span>
                            <span className="mx-2">•</span>
                            <span>5 days ago</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Badge className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Needs Input
                            </Badge>
                            <span className="text-xs text-gray-500">
                              7 replies
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
                          <h4 className="font-medium">
                            Project Timeline Updates
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>Started by Alex Morgan</span>
                            <span className="mx-2">•</span>
                            <span>1 week ago</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Resolved
                            </Badge>
                            <span className="text-xs text-gray-500">
                              12 replies
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/jessica-chen.png"
                              alt="Jessica Chen"
                            />
                            <AvatarFallback>JC</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Jessica Chen</span>{" "}
                              started a new discussion{" "}
                              <span className="text-blue-600">
                                Design System Components
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">3 days ago</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/alex-morgan.png"
                              alt="Alex Morgan"
                            />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Alex Morgan</span>{" "}
                              replied to{" "}
                              <span className="text-blue-600">
                                API Integration Issues
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">4 days ago</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/avatars/ryan-park.png"
                              alt="Ryan Park"
                            />
                            <AvatarFallback>RP</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Ryan Park</span>{" "}
                              closed discussion{" "}
                              <span className="text-blue-600">
                                Project Timeline Updates
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Project Analytics</h2>
                  <p className="text-gray-500">
                    Performance metrics and insights
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Tasks Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((project.progress / 100) * project.tasks)}/
                      {project.tasks}
                    </div>
                    <Progress value={project.progress} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-2">
                      {project.progress}% completion rate (
                      {Math.round((project.progress / 100) * project.tasks)} of{" "}
                      {project.tasks} tasks)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Time Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42h 30m</div>
                    <Progress value={70} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-2">
                      70% of estimated time (60h)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Budget Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$8,250</div>
                    <Progress value={66} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-2">
                      66% of total budget ({project.budget})
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Completion Trend</CardTitle>
                    <CardDescription>
                      Weekly task completion rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                    <DonutChart
                      data={[
                        { name: "Completed", value: 63, color: "#10b981" },
                        { name: "In Progress", value: 25, color: "#f59e0b" },
                        { name: "Not Started", value: 12, color: "#6b7280" },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Productivity</CardTitle>
                    <CardDescription>
                      Tasks completed by team member
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                    <BarChart />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>Task completion over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                  <AreaChart />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Helper function to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

// Sample projects data

type ProjectStatus = "In Progress" | "Planning" | "Completed" | "On Hold";

type ProjectT = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  progress: number;
  tasks: number;
  activity: number;
  starred: boolean;
  team: { name: string; avatar: string }[];
  priority: "High" | "Medium" | "Low";
  client: string;
  budget: string;
  startDate: string;
};

const sampleProjects: ProjectT[] = [
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
    priority: "High",
    client: "Acme Inc.",
    budget: "$12,500",
    startDate: "Oct 1, 2023",
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
    priority: "Medium",
    client: "TechCorp",
    budget: "$18,000",
    startDate: "Oct 15, 2023",
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
      { name: "Jane Doe", avatar: "/avatars/david-kim.png" },
      { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
      { name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
    ],
    priority: "Medium",
    client: "StaticMania",
    budget: "$9,800",
    startDate: "Sep 5, 2023",
  },
  {
    id: 4,
    name: "Mobile App Development",
    description: "Cross-platform mobile application",
    status: "In Progress",
    deadline: "Dec 20, 2023",
    progress: 42,
    tasks: 45,
    activity: 156,
    starred: false,
    team: [
      { name: "David Kim", avatar: "/avatars/david-kim.png" },
      { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
      { name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
    ],
    priority: "High",
    client: "MobiTech",
    budget: "$32,000",
    startDate: "Sep 15, 2023",
  },
  {
    id: 5,
    name: "E-commerce Platform",
    description: "Online shopping platform development",
    status: "On Hold",
    deadline: "Jan 10, 2024",
    progress: 30,
    tasks: 38,
    activity: 92,
    starred: false,
    team: [
      { name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
      { name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
    ],
    priority: "Low",
    client: "ShopNow Inc.",
    budget: "$24,500",
    startDate: "Oct 5, 2023",
  },
  {
    id: 6,
    name: "Analytics Dashboard",
    description: "Data visualization and reporting tool",
    status: "Planning",
    deadline: "Jan 25, 2024",
    progress: 15,
    tasks: 22,
    activity: 48,
    starred: true,
    team: [
      { name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      { name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
    ],
    priority: "Medium",
    client: "DataViz Corp",
    budget: "$16,800",
    startDate: "Nov 1, 2023",
  },
];
