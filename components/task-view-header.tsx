"use client"
import { LayoutGrid, List, Calendar, Filter, ArrowDownUp, Layers, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TaskViewHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

export default function TaskViewHeader({ activeView, onViewChange }: TaskViewHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap  justify-between gap-3">
        <div className="flex flex-wrap gap-1 items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-sm font-medium",
              activeView === "board"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50",
            )}
            onClick={() => onViewChange("board")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-sm font-medium",
              activeView === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50",
            )}
            onClick={() => onViewChange("list")}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 text-sm font-medium",
              activeView === "calendar"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50",
            )}
            onClick={() => onViewChange("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>    
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Filter Button */}
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          {/* Sort Button */}
          <Button variant="outline" size="sm" className="h-8">
            <ArrowDownUp className="h-4 w-4 mr-2" />
            Sort
          </Button>

          {/* Group By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Layers className="h-4 w-4 mr-2" />
                Group By
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Group Tasks By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Status</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Priority</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Assignee</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Project</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Due Date</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
