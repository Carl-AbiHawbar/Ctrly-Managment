"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, PauseCircle, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id: number
  name: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
}

interface ProjectStatusModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (status: "Planning" | "In Progress" | "Completed" | "On Hold", note: string) => void
  action: "complete" | "hold" | "change"
}

export function ProjectStatusModal({ project, isOpen, onClose, onStatusChange, action }: ProjectStatusModalProps) {
  const [status, setStatus] = useState<"Planning" | "In Progress" | "Completed" | "On Hold">(
    project?.status || "In Progress",
  )
  const [note, setNote] = useState("")

  if (!project) return null

  const handleSubmit = () => {
    onStatusChange(status, note)
    onClose()
  }

  const getTitle = () => {
    if (action === "complete") return "Mark Project as Completed"
    if (action === "hold") return "Put Project on Hold"
    return "Change Project Status"
  }

  const getDescription = () => {
    if (action === "complete") return "This will mark the project as completed and notify all team members."
    if (action === "hold") return "This will pause all project activities and notify team members."
    return "Update the current status of this project."
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {action === "change" ? (
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as "Planning" | "In Progress" | "Completed" | "On Hold")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="Planning" id="planning" />
                <Label htmlFor="planning" className="flex items-center cursor-pointer">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <div>
                    <div className="font-medium">Planning</div>
                    <div className="text-sm text-gray-500">Project is in the planning phase</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="In Progress" id="in-progress" />
                <Label htmlFor="in-progress" className="flex items-center cursor-pointer">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                  <div>
                    <div className="font-medium">In Progress</div>
                    <div className="text-sm text-gray-500">Project is actively being worked on</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="Completed" id="completed" />
                <Label htmlFor="completed" className="flex items-center cursor-pointer">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <div>
                    <div className="font-medium">Completed</div>
                    <div className="text-sm text-gray-500">Project has been completed</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="On Hold" id="on-hold" />
                <Label htmlFor="on-hold" className="flex items-center cursor-pointer">
                  <PauseCircle className="h-4 w-4 mr-2 text-gray-600" />
                  <div>
                    <div className="font-medium">On Hold</div>
                    <div className="text-sm text-gray-500">Project is temporarily paused</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          ) : (
            <div
              className={cn(
                "flex items-center space-x-2 rounded-md border p-4",
                action === "complete" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
              )}
            >
              {action === "complete" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <PauseCircle className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <div className="font-medium">{action === "complete" ? "Completed" : "On Hold"}</div>
                <div className="text-sm text-gray-500">
                  {action === "complete"
                    ? "This project will be marked as completed"
                    : "This project will be put on hold"}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label htmlFor="note" className="text-sm font-medium">
              Add a note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add details about this status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {action === "complete" ? "Mark as Completed" : action === "hold" ? "Put on Hold" : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
