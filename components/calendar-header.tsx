"use client";
import {
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dispatch, SetStateAction, useState } from "react";
import CalendarEventForm from "./calendar-event-form";
import Topbar from "./Shared/Topbar";

interface CalendarHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  view: "month" | "week" | "day";
  onViewChange: (view: "month" | "week" | "day") => void;
  filterProject: string | null;
  onFilterProjectChange: (project: string | null) => void;
  filterAssignee: string | null;
  onFilterAssigneeChange: (assignee: string | null) => void;
}

// Sample data for projects and team members
const projects = [
  { id: "figma", name: "Figma Design System" },
  { id: "react", name: "Keep React" },
  { id: "static", name: "StaticMania" },
  { id: "mobile", name: "Mobile App Development" },
  { id: "ecommerce", name: "E-commerce Platform" },
  { id: "analytics", name: "Analytics Dashboard" },
];

const teamMembers = [
  { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
  { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
  { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
  { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
  { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
];

export default function CalendarHeader({
  sidebarOpen,
  setSidebarOpen,
  view,
  onViewChange,
  filterProject,
  onFilterProjectChange,
  filterAssignee,
  onFilterAssigneeChange,
}: CalendarHeaderProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);

  // Format the current date based on the view
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      year: "numeric",
    };

    if (view === "week") {
      // Get the start and end of the week
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      // Format as "Month DD - Month DD, YYYY"
      const startMonth = start.toLocaleString("default", { month: "short" });
      const endMonth = end.toLocaleString("default", { month: "short" });
      const startDay = start.getDate();
      const endDay = end.getDate();
      const year = end.getFullYear();

      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    } else if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return currentDate.toLocaleDateString("en-US", options);
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <Topbar
        name="Calender"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Calendar Controls */}
      <div className="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap gap-3 flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-medium text-gray-900">
              {formatDate()}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="bg-gray-100 rounded-lg p-1 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium",
                  view === "month"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                onClick={() => onViewChange("month")}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium",
                  view === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                onClick={() => onViewChange("week")}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium",
                  view === "day"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                onClick={() => onViewChange("day")}
              >
                Day
              </Button>
            </div>

            {/* Project Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterProject
                    ? projects.find((p) => p.id === filterProject)?.name
                    : "All Projects"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilterProjectChange(null)}>
                  <span className={cn(filterProject === null && "font-medium")}>
                    All Projects
                  </span>
                </DropdownMenuItem>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => onFilterProjectChange(project.id)}
                  >
                    <span
                      className={cn(
                        filterProject === project.id && "font-medium"
                      )}
                    >
                      {project.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assignee Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Users className="h-4 w-4 mr-2" />
                  {filterAssignee ? "Assigned to" : "All Assignees"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilterAssigneeChange(null)}>
                  <span
                    className={cn(filterAssignee === null && "font-medium")}
                  >
                    All Assignees
                  </span>
                </DropdownMenuItem>
                {teamMembers.map((member) => (
                  <DropdownMenuItem
                    key={member.id}
                    onClick={() => onFilterAssigneeChange(member.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          filterAssignee === member.id && "font-medium"
                        )}
                      >
                        {member.name}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Event Form Dialog */}
      <CalendarEventForm
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        selectedDate={currentDate}
      />
    </div>
  );
}
