"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
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
  Menu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectDetailPageProps {
  id: string;
}

export default function ProjectDetailPage({ id }: ProjectDetailPageProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch project details
    const fetchProject = async () => {
      setLoading(true);
      // In a real app, you would fetch from an API
      const foundProject = sampleProjects.find((p) => p.id.toString() === id);

      if (foundProject) {
        setProject(foundProject);
      } else {
        // Handle not found
        router.push("/projects");
      }

      setLoading(false);
    };

    fetchProject();
  }, [id, router]);

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
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-4 lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => router.push("/projects")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                {project.starred ? "Unstar" : "Star Project"}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>
          </div>
        </header>

        {/* Project Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
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
                  {project.starred && (
                    <Star className="h-5 w-5 ml-2 text-yellow-500 fill-yellow-500" />
                  )}
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {project.team.map(
                  ({
                    member,
                    index,
                  }: {
                    member: TeamMember;
                    index: number;
                  }) => (
                    <Avatar
                      key={index}
                      className="h-8 w-8 border-2 border-white"
                    >
                      <AvatarImage
                        src={member?.avatar || "/placeholder.svg"}
                        alt={member?.name}
                      />
                      <AvatarFallback>
                        {getInitials(member?.name)}
                      </AvatarFallback>
                    </Avatar>
                  )
                )}
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

        {/* Project Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
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
                    {project.description.toLowerCase()}. The project involves
                    multiple phases including research, design, development,
                    testing, and deployment.
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates and changes
                    </CardDescription>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Milestones</CardTitle>
                    <CardDescription>
                      Important project deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Design System Components
                          </p>
                          <p className="text-xs text-gray-500">Due in 3 days</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">User Testing</p>
                          <p className="text-xs text-gray-500">Due in 1 week</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Documentation</p>
                          <p className="text-xs text-gray-500">
                            Due in 2 weeks
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Project Tasks</CardTitle>
                      <CardDescription>
                        Manage and track project tasks
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Task management view will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>
                        People working on this project
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Team management view will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Project Discussions</CardTitle>
                      <CardDescription>
                        Conversations and comments
                      </CardDescription>
                    </div>
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      New Thread
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Discussion threads will be implemented here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Project Analytics</CardTitle>
                  <CardDescription>
                    Performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Analytics dashboard will be implemented here
                  </p>
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

// Sample projects data (same as in projects-list.tsx)
type TeamMember = {
  name: string;
  avatar: string;
};

type ProjectDetailsT = {
  id: number;
  name: string;
  description: string;
  status: string;
  deadline: string;
  progress: number;
  tasks: number;
  activity: number;
  starred: boolean;
  team: TeamMember[];
  priority: "Low" | "Medium" | "High";
  client: string;
  budget: string;
  startDate: string;
};

const sampleProjects: ProjectDetailsT[] = [
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
      { name: "Jane Doe", avatar: "/avatars/jane-doe.png" },
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
