"use client";
import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  CheckSquare,
  Bell,
  Search,
  X,
  FileText,
  LayoutGrid,
  Calendar,
  ContactRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { SearchModal } from "./search-modal";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const projects = [
  {
    name: "Figma Design System",
    completed: "progress",
    link: "/projects/1/full-details",
    color: "bg-purple-500",
  },
  {
    name: "Keep React",
    completed: "planning",
    link: "/projects/2/full-details",
    color: "bg-blue-500",
  },
  {
    name: "StaticMania",
    completed: "completed",
    link: "/projects/3/full-details",
    color: "bg-green-500",
  },
  {
    name: "Mobile App",
    completed: "progress",
    link: "/projects/4/full-details",
    color: "bg-blue-500",
  },
  {
    name: "E-commerce",
    completed: "progress",
    link: "/projects/5/full-details",
    color: "bg-purple-500",
  },
];

const messages = [
  {
    name: "Alex Morgan",
    message: "Hey, can you review the latest design?",
    avatar: "/avatars/alex-morgan.png",
    time: "2m",
    unread: true,
  },
  {
    name: "Jessica Chen",
    message: "I've pushed the code changes",
    avatar: "/avatars/jessica-chen.png",
    time: "1h",
    unread: false,
  },
  {
    name: "Ryan Park",
    message: "Meeting at 3pm today",
    avatar: "/avatars/ryan-park.png",
    time: "3h",
    unread: false,
  },
  {
    name: "Alex Morgan",
    message: "Hey, can you review the latest design?",
    avatar: "/avatars/alex-morgan.png",
    time: "2m",
    unread: true,
  },
  {
    name: "Jessica Chen",
    message: "I've pushed the code changes",
    avatar: "/avatars/jessica-chen.png",
    time: "1h",
    unread: false,
  },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const [showAllProjects, setShowAllProjects] = useState(false);
  const visiableProjects = showAllProjects ? projects : projects.slice(0, 3);

  const [showAllMessage, setShowAllMessage] = useState(false);
  const visiableMessages = showAllMessage ? messages : messages.slice(0, 3);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 inset-y-0 left-0 z-50  w-64 bg-white border-r border-gray-200 transition-transform duration-500 ease-in-out lg:translate-x-0 lg:w-64 overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header - fixed at top */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <div className="w-18 h-18 mr-2">
              <img src="ctrly.png" />
            </div>
            <span className="text-xl font-semibold">CTRLY MANAGMENT</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Sidebar content - scrollable */}
        <div className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            {/* Main navigation */}
            <nav className="space-y-1 mb-6">
              <NavItem href="/" icon={Home}>
                Home
              </NavItem>
              <NavItem href="/projects" icon={FileText}>
                Projects
              </NavItem>
              <NavItem href="/my-tasks" icon={CheckSquare}>
                My Tasks
              </NavItem>
              <NavItem href="/kanban" icon={LayoutGrid}>
                Kanban desk
              </NavItem>
              <NavItem href="/calendar" icon={Calendar}>
                Calendar
              </NavItem>
              <NavItem href="/contacts" icon={ContactRound}>
                Contacts
              </NavItem>
              <NavItem href="/notifications" icon={Bell}>
                Notifications
              </NavItem>
              <NavItem
                href="#"
                icon={Search}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchModalOpen(true);
                }}
              >
                Search
              </NavItem>
            </nav>

            {/* Projects section */}
            <div className="mb-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Latest Projects
                </h3>
              </div>
              <div
                className={`space-y-1 ${
                  showAllProjects ? "max-h-96" : "max-h-40"
                } transition-all ease-in-out duration-700`}
              >
                {visiableProjects.map(
                  ({ name, completed, link, color }, idx) => (
                    <ProjectItem
                      key={idx}
                      name={name}
                      href={link}
                      color={color}
                      status={completed}
                    />
                  )
                )}
              </div>

              {projects.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start mt-2 text-xs text-gray-500"
                  onClick={() => setShowAllProjects(!showAllProjects)}
                >
                  {showAllProjects ? "Less all project" : "See all project"}
                  {showAllProjects ? (
                    <ChevronUp className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  )}
                </Button>
              )}
            </div>

            {/* message  */}
            <div className="mb-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Latest Message
                </h3>
              </div>
              <div
                className={`space-y-1 ${
                  showAllMessage ? "max-h-[500px]" : "max-h-40"
                } transition-all ease-in-out duration-700`}
              >
                {visiableMessages.map(
                  ({ name, message, avatar, time, unread }, idx) => (
                    <MessageItem
                      key={idx}
                      name={name}
                      message={message}
                      avatar={avatar}
                      time={time}
                      unread={unread}
                    />
                  )
                )}
              </div>

              {messages.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start mt-2 text-xs text-gray-500"
                  onClick={() => setShowAllMessage(!showAllMessage)}
                >
                  {showAllMessage ? "Less all message" : "See all message"}
                  {showAllMessage ? (
                    <ChevronUp className="h-3 w-3 ml-auto" />
                  ) : (
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function NavItem({
  href,
  icon: Icon,
  children,
  active,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = active || pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <Icon
        className={cn(
          "h-5 w-5 mr-3",
          isActive ? "text-blue-700" : "text-gray-500"
        )}
      />
      {children}
    </Link>
  );
}

interface ProjectItemProps {
  name: string;
  href: string;
  color: string;
  status: string;
}

function ProjectItem({ name, href, color, status }: ProjectItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
    >
      <span className={`h-2 w-2 rounded-full ${color} mr-3`} />
      <span className="text-gray-700">{name}</span>
      <span
        className={cn(
          "ml-auto text-xs px-1.5 py-0.5 rounded-full",
          status === "planning" && "bg-blue-100 text-blue-800",
          status === "progress" && "bg-yellow-100 text-yellow-800",
          status === "completed" && "bg-green-100 text-green-800"
        )}
      >
        {status === "progress"
          ? "Progress"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </Link>
  );
}

interface MessageItemProps {
  name: string;
  message: string;
  avatar: string;
  time: string;
  unread?: boolean;
}

function MessageItem({
  name,
  message,
  avatar,
  time,
  unread,
}: MessageItemProps) {
  return (
    <Link
      href="/messages"
      className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
    >
      <Avatar className="h-8 w-8 mr-3">
        <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-sm font-medium",
              unread ? "text-gray-900" : "text-gray-700"
            )}
          >
            {name}
          </span>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{message}</p>
      </div>
      {unread && <span className="h-2 w-2 bg-blue-600 rounded-full ml-2" />}
    </Link>
  );
}

export default Sidebar;
