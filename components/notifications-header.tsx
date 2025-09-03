"use client"

import { Bell, Search, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface NotificationsHeaderProps {
  onSettingsClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function NotificationsHeader({ onSettingsClick, searchQuery, onSearchChange }: NotificationsHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center">
        <Bell className="h-5 w-5 text-blue-600 mr-2" />
        <h1 className={`text-xl font-semibold ${showSearch ? "hidden sm:block" : ""}`}>Notifications</h1>
      </div>

      <div className="flex items-center space-x-2">
        {showSearch ? (
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-8"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => {
                onSearchChange("")
                setShowSearch(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        )}

        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Notification Settings</span>
        </Button>
      </div>
    </div>
  )
}
