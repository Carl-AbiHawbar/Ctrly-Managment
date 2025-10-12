"use client"

import { useState, useEffect } from "react"
import SimpleCalendarView from "./Simplecalendarview"

interface CalendarWrapperProps {
  view: "month" | "week" | "day"
  filterProject: string | null
  filterAssignee: string | null
}

export default function CalendarWrapper(props: CalendarWrapperProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return <SimpleCalendarView {...props} />
}
