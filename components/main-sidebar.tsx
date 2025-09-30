"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Users,
  FolderKanban,
  Bell,
  Settings,
  Home,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/kanban", label: "Kanban", icon: FolderKanban },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "#settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-64 border-r bg-background h-screen">
      <div className="h-14 flex items-center px-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6" />
          <span className="font-bold text-xl">TaskCTRLY MANAGMENTora</span>
        </Link>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Button key={index} variant={isActive ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
