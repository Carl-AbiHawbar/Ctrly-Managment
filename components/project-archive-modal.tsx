"use client";

import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface Project {
  id: number;
  name: string;
}

interface ProjectArchiveModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onArchive: (notifyTeam: boolean) => void;
}

export function ProjectArchiveModal({
  project,
  isOpen,
  onClose,
  onArchive,
}: ProjectArchiveModalProps) {
  const [notifyTeam, setNotifyTeam] = React.useState(true);

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Archive Project
          </DialogTitle>
          <DialogDescription className="text-start">
            Are you sure you want to archive "{project.name}"? This will remove
            the project from active views.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-800">Archiving a project will:</p>
            <ul className="list-disc pl-5 mt-2 text-sm text-red-800 space-y-1">
              <li>Remove it from active project lists</li>
              <li>Preserve all project data and history</li>
              <li>Allow you to restore it in the future if needed</li>
              <li>Not delete any associated files or data</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify-team"
              checked={notifyTeam}
              onCheckedChange={(checked) => setNotifyTeam(checked as boolean)}
            />
            <Label htmlFor="notify-team" className="text-sm">
              Notify team members about this change
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
      
          <Button variant="destructive" onClick={() => onArchive(notifyTeam)}>
            Archive Project
          </Button>
          {/* <Button variant="destructive" onClick={()=>alert("successfuly archive")}>
            Archive Project
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
