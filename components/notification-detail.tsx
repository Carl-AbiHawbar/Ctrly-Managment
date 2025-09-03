"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Notification } from "@/types/notification";
import { format } from "date-fns";
import Link from "next/link";

interface NotificationDetailProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationDetail({
  notification,
  onClose,
}: NotificationDetailProps) {
  const getRelatedItemLink = () => {
    switch (notification.relatedItemType) {
      case "task":
        return `/my-tasks?task=${notification.relatedItemId}`;
      case "project":
        return `/projects/${notification.relatedItemId}`;
      case "comment":
        return `/my-tasks?comment=${notification.relatedItemId}`;
      default:
        return "#";
    }
  };

  const getRelatedItemIcon = () => {
    switch (notification.relatedItemType) {
      case "task":
        return <CheckCircle2 className="h-5 w-5" />;
      case "project":
        return <FileText className="h-5 w-5" />;
      case "comment":
        return <MessageSquare className="h-5 w-5" />;
      case "system":
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getActionButtons = () => {
    switch (notification.type) {
      case "task":
        return (
          <>
            <Button className="flex-1">View Task</Button>
            <Button variant="outline" className="flex-1">
              Mark Complete
            </Button>
          </>
        );
      case "mention":
        return (
          <>
            <Button className="flex-1">Reply</Button>
            <Button variant="outline" className="flex-1">
              View Thread
            </Button>
          </>
        );
      case "project":
        return (
          <>
            <Button className="flex-1">View Project</Button>
            <Button variant="outline" className="flex-1">
              Project Settings
            </Button>
          </>
        );
      case "system":
        return (
          <>
            <Button className="flex-1">Acknowledge</Button>
            <Button variant="outline" className="flex-1">
              Learn More
            </Button>
          </>
        );
      default:
        return <Button className="flex-1">View Details</Button>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="mr-2 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h2 className="text-lg font-medium">Notification Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              {notification.sender ? (
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={notification.sender.avatar || "/placeholder.svg"}
                    alt={notification.sender.name}
                  />
                  <AvatarFallback>
                    {notification.sender.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-gray-200">
                  {getRelatedItemIcon()}
                </div>
              )}

              <div>
                <h3 className="text-base font-medium">{notification.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {format(notification.timestamp, "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-gray-700 mb-4">{notification.message}</p>

            {notification.relatedItemId &&
              notification.relatedItemType !== "system" && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 mr-2 flex items-center justify-center rounded-full bg-gray-200">
                      {getRelatedItemIcon()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Related
                        {/* {notification.relatedItemType.charAt(0).toUpperCase() + notification.relatedItemType.slice(1)} */}
                      </p>
                      <Link
                        href={getRelatedItemLink()}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            {notification.sender && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Sent by</p>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={notification.sender.avatar || "/placeholder.svg"}
                      alt={notification.sender.name}
                    />
                    <AvatarFallback>
                      {notification.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {notification.sender.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">{getActionButtons()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
