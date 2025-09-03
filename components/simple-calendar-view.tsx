"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarEvent } from "@/types/calendar";
import CalendarEventDetail from "./calendar-event-detail";
import CalendarEventForm from "./calendar-event-form";
import { useToast } from "@/components/ui/use-toast";

interface SimpleCalendarViewProps {
  view: "month" | "week" | "day";
  filterProject: string | null;
  filterAssignee: string | null;
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
    description:
      "Review the latest design system components and discuss improvements.",
    assignees: [
      { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
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
      {
        id: "user-4",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
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
    assignees: [
      { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
    ],
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
      {
        id: "user-2",
        name: "Jessica Chen",
        avatar: "/avatars/jessica-chen.png",
      },
      { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
      {
        id: "user-4",
        name: "Sarah Johnson",
        avatar: "/avatars/sarah-johnson.png",
      },
      { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
    ],
    color: "#ec4899",
  },
];

export default function SimpleCalendarView({
  view,
  filterProject,
  filterAssignee,
}: SimpleCalendarViewProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] =
    useState<CalendarEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewEventFormOpen, setIsNewEventFormOpen] = useState(false);

  // Apply filters
  useEffect(() => {
    let filtered = [...events];

    if (filterProject) {
      filtered = filtered.filter((event) => event.project === filterProject);
    }

    if (filterAssignee) {
      filtered = filtered.filter((event) =>
        event.assignees.some((assignee) => assignee.id === filterAssignee)
      );
    }

    setFilteredEvents(filtered);
  }, [events, filterProject, filterAssignee]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get days in month
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Check if the day falls within the event's date range
      return (
        (isSameDay(day, eventStart) || day > eventStart) &&
        (isSameDay(day, eventEnd) || day < eventEnd)
      );
    });
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsNewEventFormOpen(true);
  };

  // Handle event creation
  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    toast({
      title: "Event created",
      description: `"${newEvent.title}" has been added to your calendar.`,
    });
  };

  // Handle event update
  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
    toast({
      title: "Event updated",
      description: `"${updatedEvent.title}" has been updated.`,
    });
  };

  // Handle event deletion
  const handleEventDeleted = (eventId: string) => {
    const eventToDelete = events.find((e) => e.id === eventId);
    if (eventToDelete) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
      toast({
        title: "Event deleted",
        description: `"${eventToDelete.title}" has been removed from your calendar.`,
      });
    }
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInMonth();
    const firstDayOfMonth = startOfMonth(currentDate).getDay();

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-500 text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="sm:h-16 lg:h-24 p-1 border border-gray-100 rounded-md bg-gray-50"
            ></div>
          ))}

          {/* Calendar days */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={`sm:h-16 lg:h-24 p-1 border rounded-md overflow-hidden ${
                  isCurrentMonth
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50"
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-right mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs px-1 py-0.5 rounded truncate cursor-pointer"
                      style={{
                        backgroundColor: `${event.color}20`,
                        color: event.color,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view (simplified)
  const renderWeekView = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Week view is coming soon.</p>
          <p className="text-gray-500 text-sm mt-2">
            Please use the month view for now.
          </p>
        </div>
      </div>
    );
  };

  // Render day view (simplified)
  const renderDayView = () => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Day view is coming soon.</p>
          <p className="text-gray-500 text-sm mt-2">
            Please use the month view for now.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {filteredEvents.length} events
          </Badge>
        </div>
      </div>

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <CalendarEventDetail
          event={selectedEvent}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsEditFormOpen(true);
          }}
          onDelete={() => {
            handleEventDeleted(selectedEvent.id);
            setIsDetailOpen(false);
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
  );
}
