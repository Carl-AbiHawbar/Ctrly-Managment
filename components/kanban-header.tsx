"use client";
import { Search, Filter, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dispatch, SetStateAction } from "react";
import Topbar from "./Shared/Topbar";

interface KanbanHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  filterProject: string | null;
  onFilterProjectChange: (project: string | null) => void;
  filterAssignee: string | null;
  onFilterAssigneeChange: (assignee: string | null) => void;
  filterPriority: string | null;
  onFilterPriorityChange: (priority: string | null) => void;
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

const priorities = [
  { id: "high", name: "High", color: "text-red-600" },
  { id: "medium", name: "Medium", color: "text-yellow-600" },
  { id: "low", name: "Low", color: "text-green-600" },
];

export default function KanbanHeader({
  sidebarOpen,
  setSidebarOpen,
  filterProject,
  onFilterProjectChange,
  filterAssignee,
  onFilterAssigneeChange,
  filterPriority,
  onFilterPriorityChange,
}: KanbanHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <Topbar
        name="Kanban"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Filters Bar */}
      <div className="hidden md:block border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-3 flex-wrap flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="pl-8 h-9 w-full sm:w-64 bg-gray-50 border-gray-200"
              />
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
              <DropdownMenuContent align="start" className="w-56">
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
              <DropdownMenuContent align="start" className="w-56">
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

            {/* Priority Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Tag className="h-4 w-4 mr-2" />
                  {filterPriority
                    ? `${
                        priorities.find((p) => p.id === filterPriority)?.name
                      } Priority`
                    : "All Priorities"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilterPriorityChange(null)}>
                  <span
                    className={cn(filterPriority === null && "font-medium")}
                  >
                    All Priorities
                  </span>
                </DropdownMenuItem>
                {priorities.map((priority) => (
                  <DropdownMenuItem
                    key={priority.id}
                    onClick={() => onFilterPriorityChange(priority.id)}
                  >
                    <span
                      className={cn(
                        priority.color,
                        filterPriority === priority.id && "font-medium"
                      )}
                    >
                      {priority.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
