"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Notification, NotificationType } from "@/types/notification"
import { Bell, CheckCircle2, Clock, FileText, MessageSquare, MoreVertical, Info } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { isToday, isYesterday, formatDistanceToNow } from "date-fns"

interface NotificationsListProps {
  filter: "all" | NotificationType
  searchQuery: string
  onSelectNotification: (notification: Notification) => void
  selectedNotificationId?: string
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "task",
    title: "Task assigned to you",
    message: "Alex Morgan assigned you the task 'Update design system'",
    sender: {
      name: "Alex Morgan",
      avatar: "/avatars/alex-morgan.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    relatedItemId: "task-123",
    relatedItemType: "task",
  },
  {
    id: "2",
    type: "mention",
    title: "You were mentioned in a comment",
    message: "Jessica Chen mentioned you in a comment: 'Can @you review this by tomorrow?'",
    sender: {
      name: "Jessica Chen",
      avatar: "/avatars/jessica-chen.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    relatedItemId: "comment-456",
    relatedItemType: "comment",
  },
  {
    id: "3",
    type: "project",
    title: "Project status updated",
    message: "The project 'Figma Design System' status changed to 'In Progress'",
    sender: {
      name: "Ryan Park",
      avatar: "/avatars/ryan-park.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    relatedItemId: "project-789",
    relatedItemType: "project",
  },
  {
    id: "4",
    type: "task",
    title: "Task completed",
    message: "David Kim completed the task 'Create wireframes for homepage'",
    sender: {
      name: "David Kim",
      avatar: "/avatars/david-kim.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    relatedItemId: "task-234",
    relatedItemType: "task",
  },
  {
    id: "5",
    type: "system",
    title: "System maintenance",
    message: "Scheduled maintenance will occur on Sunday at 2:00 AM UTC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    relatedItemId: "system-567",
    relatedItemType: "system",
  },
  {
    id: "6",
    type: "mention",
    title: "You were mentioned in a task",
    message:
      "Sarah Johnson mentioned you in the task 'Prepare Q3 report': '@you can you help with the financial section?'",
    sender: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah-johnson.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: false,
    relatedItemId: "task-345",
    relatedItemType: "task",
  },
  {
    id: "7",
    type: "project",
    title: "New project created",
    message: "William Jack created a new project 'Mobile App Redesign' and added you as a member",
    sender: {
      name: "William Jack",
      avatar: "/avatars/william-jack.png",
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    read: true,
    relatedItemId: "project-901",
    relatedItemType: "project",
  },
  {
    id: "8",
    type: "system",
    title: "Account security",
    message: "Your account password was changed successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    read: true,
    relatedItemId: "system-678",
    relatedItemType: "system",
  },
]

export function NotificationsList({
  filter,
  searchQuery,
  onSelectNotification,
  selectedNotificationId,
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Filter notifications based on type and search query
    let filtered = [...mockNotifications]

    if (filter !== "all") {
      filtered = filtered.filter((notification) => notification.type === filter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(query) || notification.message.toLowerCase().includes(query),
      )
    }

    setNotifications(filtered)
  }, [filter, searchQuery])

  const markAsRead = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "mention":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "project":
        return <FileText className="h-5 w-5 text-purple-500" />
      case "system":
        return <Bell className="h-5 w-5 text-gray-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  // Group notifications by date
  const todayNotifications = notifications.filter((n) => isToday(n.timestamp))
  const yesterdayNotifications = notifications.filter((n) => isYesterday(n.timestamp))
  const olderNotifications = notifications.filter((n) => !isToday(n.timestamp) && !isYesterday(n.timestamp))

  const renderNotificationGroup = (title: string, items: Notification[]) => {
    if (items.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">{title}</h3>
        <div className="divide-y divide-gray-100">
          {items.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedNotificationId === notification.id ? "bg-blue-50" : ""
              } ${!notification.read ? "bg-blue-50/30" : ""}`}
              onClick={() => onSelectNotification(notification)}
            >
              <div className="flex items-start">
                {notification.sender ? (
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src={notification.sender.avatar || "/placeholder.svg"}
                      alt={notification.sender.name}
                    />
                    <AvatarFallback>{notification.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-gray-100">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center ml-2">
                      {!notification.read && <span className="h-2 w-2 bg-blue-600 rounded-full mr-2" />}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem onClick={(e: any) => markAsRead(notification.id, e)}>
                              Mark as read
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Mute this type</DropdownMenuItem>
                          <DropdownMenuItem>Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500 max-w-md">
            {filter !== "all"
              ? `You don't have any ${filter} notifications at the moment.`
              : searchQuery
                ? `No notifications match "${searchQuery}".`
                : "You're all caught up! Check back later for new notifications."}
          </p>
        </div>
      ) : (
        <>
          {renderNotificationGroup("Today", todayNotifications)}
          {renderNotificationGroup("Yesterday", yesterdayNotifications)}
          {renderNotificationGroup("Older", olderNotifications)}
        </>
      )}
    </div>
  )
}
