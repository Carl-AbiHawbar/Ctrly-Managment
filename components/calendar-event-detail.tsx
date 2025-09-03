"use client"

import type { CalendarEvent } from "@/types/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Trash, Edit } from "lucide-react"
import { format } from "date-fns"

interface CalendarEventDetailProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CalendarEventDetail({ event, isOpen, onClose, onEdit, onDelete }: CalendarEventDetailProps) {
  // Format date and time
  const formatDateTime = () => {
    if (event.allDay) {
      if (
        event.start.getDate() === event.end.getDate() &&
        event.start.getMonth() === event.end.getMonth() &&
        event.start.getFullYear() === event.end.getFullYear()
      ) {
        return `${format(event.start, "EEEE, MMMM d, yyyy")} (All day)`
      } else {
        return `${format(event.start, "MMMM d, yyyy")} - ${format(event.end, "MMMM d, yyyy")} (All day)`
      }
    } else {
      if (
        event.start.getDate() === event.end.getDate() &&
        event.start.getMonth() === event.end.getMonth() &&
        event.start.getFullYear() === event.end.getFullYear()
      ) {
        return `${format(event.start, "EEEE, MMMM d, yyyy")} · ${format(event.start, "h:mm a")} - ${format(
          event.end,
          "h:mm a",
        )}`
      } else {
        return `${format(event.start, "MMMM d, yyyy h:mm a")} - ${format(event.end, "MMMM d, yyyy h:mm a")}`
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription>{event.projectName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and Time */}
          <div className="flex items-start">
            <div className="mr-3 mt-0.5">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="font-medium">{formatDateTime()}</p>
            </div>
          </div>

          {/* Location (if available) */}
          {event.location && (
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p>{event.location}</p>
              </div>
            </div>
          )}

          {/* Description (if available) */}
          {event.description && (
            <div className="pt-2">
              <p className="text-sm text-gray-700">{event.description}</p>
            </div>
          )}

          {/* Assignees */}
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-500 mb-2">Attendees</p>
            <div className="flex flex-wrap gap-2">
              {event.assignees.map((assignee) => (
                <div key={assignee.id} className="flex items-center bg-gray-50 rounded-full pl-1 pr-3 py-1">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{assignee.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Badge */}
          <div className="pt-2">
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-700"
              style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
            >
              {event.projectName}
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
