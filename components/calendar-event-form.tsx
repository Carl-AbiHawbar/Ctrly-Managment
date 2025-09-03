"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, ChevronsUpDown, Clock, Calendar, MapPin, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format, addHours } from "date-fns"

interface CalendarEventFormProps {
  isOpen: boolean
  onClose: () => void
  event?: CalendarEvent
  selectedDate?: Date
  onEventCreated?: (event: CalendarEvent) => void
  onEventUpdated?: (event: CalendarEvent) => void
}

// Sample data for projects and team members
const projects = [
  { id: "figma", name: "Figma Design System", color: "#4f46e5" },
  { id: "react", name: "Keep React", color: "#ec4899" },
  { id: "static", name: "StaticMania", color: "#10b981" },
  { id: "mobile", name: "Mobile App Development", color: "#0ea5e9" },
  { id: "ecommerce", name: "E-commerce Platform", color: "#f59e0b" },
  { id: "analytics", name: "Analytics Dashboard", color: "#6366f1" },
]

const teamMembers = [
  { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
  { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
  { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
  { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
  { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
]

export default function CalendarEventForm({
  isOpen,
  onClose,
  event,
  selectedDate,
  onEventCreated,
  onEventUpdated,
}: CalendarEventFormProps) {
  const [title, setTitle] = useState("")
  const [project, setProject] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addHours(new Date(), 1))
  const [assigneesOpen, setAssigneesOpen] = useState(false)
  const [selectedAssignees, setSelectedAssignees] = useState<typeof teamMembers>([])

  // Initialize form with event data if editing
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setProject(event.project)
      setLocation(event.location || "")
      setDescription(event.description || "")
      setAllDay(event.allDay)
      setStartDate(event.start)
      setEndDate(event.end)
      setSelectedAssignees(
        event.assignees.map((assignee) => {
          const member = teamMembers.find((m) => m.id === assignee.id)
          return member || assignee
        }),
      )
    } else if (selectedDate) {
      setStartDate(selectedDate)
      setEndDate(addHours(selectedDate, 1))
    }
  }, [event, selectedDate])

  // Toggle assignee selection
  const toggleAssignee = (member: (typeof teamMembers)[0]) => {
    setSelectedAssignees((prev) => {
      const isSelected = prev.some((a) => a.id === member.id)
      if (isSelected) {
        return prev.filter((a) => a.id !== member.id)
      } else {
        return [...prev, member]
      }
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !project) {
      return
    }

    const selectedProject = projects.find((p) => p.id === project)

    const eventData: CalendarEvent = {
      id: event ? event.id : `event-${Date.now()}`,
      title,
      start: startDate,
      end: endDate,
      allDay,
      project,
      projectName: selectedProject?.name || "",
      location,
      description,
      assignees: selectedAssignees.map((a) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
      })),
      color: selectedProject?.color || "#4f46e5",
    }

    if (event && onEventUpdated) {
      onEventUpdated(eventData)
    } else if (onEventCreated) {
      onEventCreated(eventData)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-full lg:h-max overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Project</Label>
            <Select value={project} onValueChange={setProject} required>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color }}></div>
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
            <Label htmlFor="all-day">All day event</Label>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="grid gap-2">
              <Label>Start</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const newDate = new Date(startDate)
                      const [year, month, day] = e.target.value.split("-").map(Number)
                      newDate.setFullYear(year, month - 1, day)
                      setStartDate(newDate)
                    }}
                  />
                </div>
                {!allDay && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={format(startDate, "HH:mm")}
                      onChange={(e) => {
                        const newDate = new Date(startDate)
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        newDate.setHours(hours, minutes)
                        setStartDate(newDate)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>End</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const newDate = new Date(endDate)
                      const [year, month, day] = e.target.value.split("-").map(Number)
                      newDate.setFullYear(year, month - 1, day)
                      setEndDate(newDate)
                    }}
                  />
                </div>
                {!allDay && (
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <Input
                      type="time"
                      value={format(endDate, "HH:mm")}
                      onChange={(e) => {
                        const newDate = new Date(endDate)
                        const [hours, minutes] = e.target.value.split(":").map(Number)
                        newDate.setHours(hours, minutes)
                        setEndDate(newDate)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location (optional)</Label>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-500" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Attendees</Label>
            <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={assigneesOpen} className="justify-between">
                  {selectedAssignees.length > 0
                    ? `${selectedAssignees.length} attendee${selectedAssignees.length > 1 ? "s" : ""}`
                    : "Select attendees"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search team members..." />
                  <CommandList>
                    <CommandEmpty>No team member found.</CommandEmpty>
                    <CommandGroup>
                      {teamMembers.map((member) => {
                        const isSelected = selectedAssignees.some((a) => a.id === member.id)
                        return (
                          <CommandItem key={member.id} value={member.name} onSelect={() => toggleAssignee(member)}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{member.name}</span>
                            </div>
                            <Check className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedAssignees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAssignees.map((member) => (
                <div key={member.id} className="flex items-center space-x-1 bg-gray-100 rounded-full pl-1 pr-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{member.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={() => toggleAssignee(member)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{event ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
