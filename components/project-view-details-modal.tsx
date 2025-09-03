"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Users, BarChart2, MessageSquare, CheckSquare, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id: number
  name: string
  description: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
  deadline: string
  progress: number
  tasks: number
  activity: number
  starred: boolean
  team: {
    name: string
    avatar: string
  }[]
  priority: "Low" | "Medium" | "High"
  client: string
  budget: string
  startDate: string
}

interface ProjectViewDetailsModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectViewDetailsModal({ project, isOpen, onClose }: ProjectViewDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  if (!project) return null

  const handleOpenFullProject = () => {
    onClose()
    router.push(`/projects/${project.id}/full-details`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start space-x-3">
            <div
              className={cn(
                "w-2 h-16 rounded-full",
                project.status === "In Progress" && "bg-yellow-500",
                project.status === "Completed" && "bg-green-500",
                project.status === "Planning" && "bg-blue-500",
                project.status === "On Hold" && "bg-gray-500",
              )}
            />
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center">{project.name}</DialogTitle>
              <DialogDescription>{project.description}</DialogDescription>
              <div className="flex items-center mt-2 space-x-4">
                <Badge
                  className={cn(
                    "font-medium",
                    project.status === "In Progress" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    project.status === "Completed" && "bg-green-100 text-green-800 hover:bg-green-100",
                    project.status === "Planning" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                    project.status === "On Hold" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
                  )}
                >
                  {project.status}
                </Badge>
                <Badge
                  className={cn(
                    "font-medium",
                    project.priority === "High" && "bg-red-100 text-red-800 hover:bg-red-100",
                    project.priority === "Medium" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    project.priority === "Low" && "bg-green-100 text-green-800 hover:bg-green-100",
                  )}
                >
                  {project.priority} Priority
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold">{project.progress}%</div>
              <div className="text-xs text-gray-500">
                {project.tasks} tasks ({Math.round((project.progress / 100) * project.tasks)} completed)
              </div>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Budget</div>
            <div className="text-xl font-bold">{project.budget}</div>
            <div className="text-xs text-gray-500 mt-1">Client: {project.client}</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Team</div>
            <div className="flex -space-x-2 mb-2">
              {project.team.map((member, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div className="text-xs text-gray-500">{project.team.length} team members</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Dates</div>
            <div className="flex items-center text-gray-700 text-sm mb-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Start: {project.startDate}</span>
            </div>
            <div className="flex items-center text-gray-700 text-sm">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>Deadline: {project.deadline}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className=" mt-6">
          <TabsList className="flex flex-wrap justify-start h-auto gap-2  mb-6">
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
                <CardDescription>Detailed information about the project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This is a comprehensive project aimed at {project.description.toLowerCase()}. The project involves
                  multiple phases including research, design, development, testing, and deployment.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Project Goals</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Create a comprehensive design system</li>
                      <li>Implement responsive components</li>
                      <li>Ensure accessibility compliance</li>
                      <li>Develop documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Key Deliverables</h4>
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
                  <CardDescription>Latest updates and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/jessica-chen.png" alt="Jessica Chen" />
                        <AvatarFallback>JC</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Jessica Chen updated the design files</p>
                        <p className="text-xs text-gray-500">Today at 10:30 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/alex-morgan.png" alt="Alex Morgan" />
                        <AvatarFallback>AM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Alex Morgan completed 3 tasks</p>
                        <p className="text-xs text-gray-500">Yesterday at 4:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/ryan-park.png" alt="Ryan Park" />
                        <AvatarFallback>RP</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Ryan Park added new comments</p>
                        <p className="text-xs text-gray-500">Yesterday at 2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Milestones</CardTitle>
                  <CardDescription>Important project deadlines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Design System Components</p>
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
                        <p className="text-xs text-gray-500">Due in 2 weeks</p>
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
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>Manage and track project tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-1.5 h-6 rounded-full ${i % 3 === 0 ? "bg-green-500" : i % 3 === 1 ? "bg-yellow-500" : "bg-blue-500"}`}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {i % 4 === 0
                              ? "Create wireframes for user profile"
                              : i % 4 === 1
                                ? "Implement responsive design"
                                : i % 4 === 2
                                  ? "Test accessibility features"
                                  : "Update documentation"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {i % 3 === 0 ? "Completed" : i % 3 === 1 ? "In Progress" : "To Do"} • Due{" "}
                            {i % 2 === 0 ? "Tomorrow" : "in 3 days"}
                          </p>
                        </div>
                      </div>
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={`/avatars/${i % 3 === 0 ? "jessica-chen" : i % 3 === 1 ? "alex-morgan" : "ryan-park"}.png`}
                        />
                        <AvatarFallback>{i % 3 === 0 ? "JC" : i % 3 === 1 ? "AM" : "RP"}</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" className="mr-2">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Button>
                  <Button size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go to Kanban Board
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>People working on this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">
                            {index === 0 ? "Project Manager" : index === 1 ? "UI/UX Designer" : "Frontend Developer"}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardHeader>
                <CardTitle>Project Discussions</CardTitle>
                <CardDescription>Conversations and comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start space-x-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/avatars/${i === 1 ? "jessica-chen" : "alex-morgan"}.png`} />
                          <AvatarFallback>{i === 1 ? "JC" : "AM"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium text-sm">{i === 1 ? "Jessica Chen" : "Alex Morgan"}</p>
                            <span className="mx-2 text-gray-300">•</span>
                            <p className="text-xs text-gray-500">{i === 1 ? "2 days ago" : "Yesterday"}</p>
                          </div>
                          <p className="text-sm mt-1">
                            {i === 1
                              ? "I've updated the design files with the latest changes. Please review when you get a chance."
                              : "The responsive layout is working well on mobile, but we need to fix some issues on tablet view."}
                          </p>
                        </div>
                      </div>

                      <div className="ml-11 space-y-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={`/avatars/${i === 1 ? "ryan-park" : "jessica-chen"}.png`} />
                            <AvatarFallback>{i === 1 ? "RP" : "JC"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium text-sm">{i === 1 ? "Ryan Park" : "Jessica Chen"}</p>
                              <span className="mx-2 text-gray-300">•</span>
                              <p className="text-xs text-gray-500">{i === 1 ? "1 day ago" : "5 hours ago"}</p>
                            </div>
                            <p className="text-sm mt-1">
                              {i === 1
                                ? "Thanks for the update! I'll take a look at them this afternoon."
                                : "I'll check the tablet view and fix those issues by tomorrow."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Tasks Completed</div>
                    <div className="text-2xl font-bold">
                      {Math.round((project.progress / 100) * project.tasks)}/{project.tasks}
                    </div>
                    <Progress value={project.progress} className="h-2 mt-2" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Time Spent</div>
                    <div className="text-2xl font-bold">42h 30m</div>
                    <div className="text-xs text-gray-500 mt-1">Out of 60h estimated</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Budget Used</div>
                    <div className="text-2xl font-bold">$8,250</div>
                    <div className="text-xs text-gray-500 mt-1">Out of {project.budget}</div>
                  </div>
                </div>

                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Project analytics charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button variant="outline" className="mr-2" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleOpenFullProject}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Full Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}
