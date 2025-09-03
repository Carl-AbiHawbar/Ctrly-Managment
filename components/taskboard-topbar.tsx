"use client"

import { useState } from "react"
import { Sun, Moon, Plus, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TaskboardTopbarProps {
  onMenuButtonClick: () => void
}

export default function TaskboardTopbar({ onMenuButtonClick }: TaskboardTopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Here you would implement actual theme switching logic
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Page Title */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-4 lg:hidden" onClick={onMenuButtonClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">My Tasks</h1>
        </div>

        {/* Right: Theme Toggle, New Project, User Avatar */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* New Project Button */}
          <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>

          {/* User Avatar */}
          <Avatar className="h-9 w-9 border-2 border-white">
            <AvatarImage src="/avatars/alex-morgan.png" alt="User" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
