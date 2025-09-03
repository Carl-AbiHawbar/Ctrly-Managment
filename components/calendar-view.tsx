"use client"

import { useEffect, useState, useRef } from "react"
import type { CalendarEvent } from "@/types/calendar"
import { useToast } from "@/components/ui/use-toast"
import CalendarEventDetail from "./calendar-event-detail"
import CalendarEventForm from "./calendar-event-form"

// We'll load FullCalendar and plugins only on the client side
let FullCalendarComponent: any = null
let dayGridPlugin: any = null
let timeGridPlugin: any = null
let interactionPlugin: any = null

interface CalendarViewProps {
  view: "month" | "week" | "day"
  filterProject: string | null
  filterAssignee: string | null
}

// Sample events data
const initialEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Design System Review",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 10, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 10, 12, 0),
    allDay: false,
    project: "figma",
    projectName: "Figma Design System",
    location: "Meeting Room A",
    description: "Review the latest design system components and discuss improvements.",
    assignees: [
      { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
    ],
    color: "#4f46e5",
  },
  {
    id: "event-2",
    title: "Mobile App Sprint Planning",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 14, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 16, 0),
    allDay: false,
    project: "mobile",
    projectName: "Mobile App Development",
    location: "Virtual Meeting",
    description: "Plan the next sprint for the mobile app development team.",
    assignees: [
      { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
      { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
    ],
    color: "#0ea5e9",
  },
  {
    id: "event-3",
    title: "Website Launch",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    allDay: true,
    project: "static",
    projectName: "StaticMania",
    location: "",
    description: "Official launch of the redesigned website.",
    assignees: [
      { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
    ],
    color: "#10b981",
  },
  {
    id: "event-4",
    title: "Client Meeting",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 9, 0),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 12, 10, 30),
    allDay: false,
    project: "ecommerce",
    projectName: "E-commerce Platform",
    location: "Client Office",
    description: "Discuss project requirements and timeline with the client.",
    assignees: [{ id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" }],
    color: "#f59e0b",
  },
  {
    id: "event-5",
    title: "Team Building",
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 26),
    allDay: true,
    project: "react",
    projectName: "Keep React",
    location: "City Park",
    description: "Team building activities and social event.",
    assignees: [
      { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
      { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
      { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
      { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
    ],
    color: "#ec4899",
  },
]

export default function CalendarView({ view, filterProject, filterAssignee }: CalendarViewProps) {
  const { toast } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isNewEventFormOpen, setIsNewEventFormOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [calendarLoaded, setCalendarLoaded] = useState(false)
  const calendarRef = useRef<any>(null)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)

    // Dynamically import FullCalendar and plugins
    const loadFullCalendar = async () => {
      try {
        const FullCalendarModule = await import("@fullcalendar/react")
        const dayGridModule = await import("@fullcalendar/daygrid")
        const timeGridModule = await import("@fullcalendar/timegrid")
        const interactionModule = await import("@fullcalendar/interaction")

        FullCalendarComponent = FullCalendarModule.default
        dayGridPlugin = dayGridModule.default
        timeGridPlugin = timeGridModule.default
        interactionPlugin = interactionModule.default

        setCalendarLoaded(true)
      } catch (error) {
        console.error("Error loading FullCalendar:", error)
      }
    }

    loadFullCalendar()

    // Cleanup function
    return () => {
      if (calendarRef.current && calendarRef.current.getApi) {
        try {
          const api = calendarRef.current.getApi()
          api.destroy()
        } catch (error) {
          console.error("Error destroying calendar:", error)
        }
      }
    }
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...events]

    if (filterProject) {
      filtered = filtered.filter((event) => event.project === filterProject)
    }

    if (filterAssignee) {
      filtered = filtered.filter((event) => event.assignees.some((assignee) => assignee.id === filterAssignee))
    }

    setFilteredEvents(filtered)
  }, [events, filterProject, filterAssignee])

  // Map the view prop to FullCalendar view
  const getCalendarView = () => {
    switch (view) {
      case "month":
        return "dayGridMonth"
      case "week":
        return "timeGridWeek"
      case "day":
        return "timeGridDay"
      default:
        return "dayGridMonth"
    }
  }

  // Handle event click
  const handleEventClick = (info: any) => {
    const eventId = info.event.id
    const event = events.find((e) => e.id === eventId)
    if (event) {
      setSelectedEvent(event)
      setIsDetailOpen(true)
    }
  }

  // Handle date click
  const handleDateClick = (info: any) => {
    setSelectedDate(info.date)
    setIsNewEventFormOpen(true)
  }

  // Handle event creation
  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent])
    toast({
      title: "Event created",
      description: `"${newEvent.title}" has been added to your calendar.`,
    })
  }

  // Handle event update
  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents((prevEvents) => prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
    toast({
      title: "Event updated",
      description: `"${updatedEvent.title}" has been updated.`,
    })
  }

  // Handle event deletion
  const handleEventDeleted = (eventId: string) => {
    const eventToDelete = events.find((e) => e.id === eventId)
    if (eventToDelete) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      toast({
        title: "Event deleted",
        description: `"${eventToDelete.title}" has been removed from your calendar.`,
      })
    }
  }

  // Loading state
  if (!isClient || !calendarLoaded) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  // Render the calendar
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {isClient && calendarLoaded && FullCalendarComponent && (
          <FullCalendarComponent
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={getCalendarView()}
            headerToolbar={false}
            events={filteredEvents.map((event) => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              allDay: event.allDay,
              backgroundColor: event.color,
              borderColor: event.color,
            }))}
            height="auto"
            aspectRatio={1.8}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            nowIndicator={true}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        )}
      </div>

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <CalendarEventDetail
          event={selectedEvent}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false)
            setIsEditFormOpen(true)
          }}
          onDelete={() => {
            handleEventDeleted(selectedEvent.id)
            setIsDetailOpen(false)
          }}
        />
      )}

      {/* Edit Event Form */}
      {selectedEvent && (
        <CalendarEventForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          event={selectedEvent}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* New Event Form */}
      {selectedDate && (
        <CalendarEventForm
          isOpen={isNewEventFormOpen}
          onClose={() => setIsNewEventFormOpen(false)}
          selectedDate={selectedDate}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  )
}
