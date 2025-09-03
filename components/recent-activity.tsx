"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle,
  FileEdit,
  Mail,
  MessageSquare,
  Phone,
  Video,
} from "lucide-react";
import img1 from "@/public/avatars/david-kim.png";
import img2 from "@/public/avatars/alex-morgan.png";
import img3 from "@/public/avatars/jessica-chen.png";
import img4 from "@/public/avatars/ryan-park.png";
import img5 from "@/public/avatars/sarah-johnson.png";
import img6 from "@/public/avatars/william-jack.png";
import Image, { StaticImageData } from "next/image";

interface ActivityUser {
  name: string;
  avatar: string | StaticImageData;
}

interface Activity {
  id: number;
  type: "email" | "meeting" | "task" | "note" | "call" | "message";
  title: string;
  description: string;
  date: string;
  duration?: string;
  user: ActivityUser;
}

interface RecentActivityProps {
  showAll?: boolean;
}

// Sample activity data
const activityData: Activity[] = [
  {
    id: 1,
    type: "email",
    title: "Email sent",
    description:
      "Sent project update and requested feedback on the latest design mockups",
    date: "2023-06-15T14:30:00",
    user: {
      name: "Sarah Johnson",
      avatar: img1
    },
  },
  {
    id: 2,
    type: "meeting",
    title: "Video meeting",
    description: "Discussed design system implementation and timeline",
    date: "2023-06-14T10:00:00",
    duration: "45 minutes",
    user: {
      name: "David Chen",
      avatar: img2
    },
  },
  {
    id: 3,
    type: "task",
    title: "Task assigned",
    description: "Assigned to create wireframes for the new dashboard layout",
    date: "2023-06-12T09:15:00",
    user: {
      name: "Michael Rodriguez",
      avatar: img3
    },
  },
  {
    id: 4,
    type: "note",
    title: "Note added",
    description: "Added note about design preferences and brand guidelines",
    date: "2023-06-10T16:45:00",
    user: {
      name: "Emily Wong",
      avatar: img4
    },
  },
  {
    id: 5,
    type: "call",
    title: "Phone call",
    description: "Discussed project requirements and timeline",
    date: "2023-06-08T11:30:00",
    duration: "15 minutes",
    user: {
      name: "James Wilson",
      avatar: img5
    },
  },
  {
    id: 6,
    type: "message",
    title: "Message sent",
    description: "Sent a message about the upcoming team meeting",
    date: "2023-06-05T13:20:00",
    user: {
      name: "Sarah Johnson",
      avatar: img6
    },
  },
];

export default function RecentActivity({
  showAll = false,
}: RecentActivityProps) {
  const [displayCount, setDisplayCount] = useState(3);

  // If no activities, show empty state
  if (activityData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity found.
      </div>
    );
  }

  // Get activities to display
  const displayedActivities = showAll
    ? activityData
    : activityData.slice(0, displayCount);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get icon for activity type
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Video className="h-4 w-4" />;
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      case "note":
        return <FileEdit className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Get color for activity type - using a mapping object instead of string interpolation
  const getActivityColor = (type: Activity["type"]) => {
    const colorMap = {
      email: "bg-blue-100 text-blue-600",
      meeting: "bg-purple-100 text-purple-600",
      task: "bg-green-100 text-green-600",
      note: "bg-yellow-100 text-yellow-600",
      call: "bg-red-100 text-red-600",
      message: "bg-indigo-100 text-indigo-600",
    };

    return colorMap[type] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      {displayedActivities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(
              activity.type
            )}`}
          >
            {getActivityIcon(activity.type)}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-gray-600 mt-1">{activity.description}</p>

                {activity.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <span>Duration:</span>
                    <span>{activity.duration}</span>
                  </div>
                )}
              </div>

              <div className="">
                <div className="text-sm text-gray-500">
                  {formatDate(activity.date)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(activity.date)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-6 w-6">
                <Image
                  src={activity.user.avatar || "/placeholder.svg"}
                  alt={activity.user.name}
                />
              </Avatar>
              <span className="text-sm text-gray-600">
                {activity.user.name}
              </span>
            </div>
          </div>
        </div>
      ))}

      {!showAll && activityData.length > displayCount && (
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => setDisplayCount((prev) => prev + 3)}
        >
          Load More
        </Button>
      )}
    </div>
  );
}
