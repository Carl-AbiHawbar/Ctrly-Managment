"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, CheckCircle, AlertCircle, FileText, Users } from "lucide-react"
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

interface ProjectTimelineModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectTimelineModal({ project, isOpen, onClose }: ProjectTimelineModalProps) {
  if (!project) return null

  // Generate timeline events based on project data
  const timelineEvents = [
    {
      date: "May 1, 2023",
      title: "Project Started",
      description: `${project.name} project was initiated`,
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      iconBg: "bg-blue-100",
    },
    {
      date: "May 5, 2023",
      title: "Requirements Gathering",
      description: "Team collected and analyzed project requirements",
      icon: <FileText className="h-4 w-4 text-purple-600" />,
      iconBg: "bg-purple-100",
    },
    {
      date: "May 15, 2023",
      title: "Design Phase",
      description: "UI/UX design and prototyping began",
      icon: <Users className="h-4 w-4 text-indigo-600" />,
      iconBg: "bg-indigo-100",
      assignee: {
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
    },
    {
      date: "June 1, 2023",
      title: "Development Started",
      description: "Team began implementing designs",
      icon: <Clock className="h-4 w-4 text-green-600" />,
      iconBg: "bg-green-100",
      assignee: {
        name: "Alex Morgan",
        avatar: "/avatars/alex-morgan.png",
      },
    },
    {
      date: "June 15, 2023",
      title: "First Milestone Completed",
      description: "Core functionality implemented",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      iconBg: "bg-green-100",
      status: "Completed",
    },
    {
      date: "July 1, 2023",
      title: "Testing Phase",
      description: "QA team began testing the application",
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      iconBg: "bg-yellow-100",
      status: "In Progress",
    },
    {
      date: project.deadline,
      title: "Project Deadline",
      description: "Expected completion date",
      icon: <Calendar className="h-4 w-4 text-red-600" />,
      iconBg: "bg-red-100",
      isFuture: true,
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-start">
            {project.name} Timeline
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
            <div className="flex flex-wrap gap-4 items-center">
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
              <div className="text-sm text-gray-500">
                <span className="font-medium">{project.progress}%</span> Complete
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 text-nowrap">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Started: {project.startDate}</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-3 lg:p-6">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Timeline events */}
                <div className="space-y-8">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className={`relative flex items-start ${event.isFuture ? "opacity-60" : ""}`}>
                      <div className={`absolute left-4 top-4 w-4 h-0.5 bg-gray-200`} />
                      <div className={`${event.iconBg} rounded-full p-2 mr-4 z-10`}>{event.icon}</div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 items-center justify-between">
                          <h3 className="text-sm font-medium">{event.title}</h3>
                          <span className="text-xs text-gray-500">{event.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>

                        <div className="mt-2 flex items-center justify-between">
                          {event.assignee ? (
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage
                                  src={event.assignee.avatar || "/placeholder.svg"}
                                  alt={event.assignee.name}
                                />
                                <AvatarFallback>{getInitials(event.assignee.name)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{event.assignee.name}</span>
                            </div>
                          ) : (
                            <div />
                          )}

                          {event.status && (
                            <Badge
                              className={cn(
                                "text-xs",
                                event.status === "Completed" && "bg-green-100 text-green-800 hover:bg-green-100",
                                event.status === "In Progress" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                              )}
                            >
                              {event.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
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
