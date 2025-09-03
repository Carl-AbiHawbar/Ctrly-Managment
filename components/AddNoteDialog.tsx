"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AddNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: (note: { content: string; author: string; date: string }) => void;
}

export default function AddNoteDialog({
  isOpen,
  onClose,
  onAddNote,
}: AddNoteDialogProps) {
  const [noteContent, setNoteContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteContent.trim()) return;

    // Create a new note object
    const newNote = {
      content: noteContent,
      author: "Current User", // In a real app, this would come from authentication
      date: new Date().toISOString(),
    };

    // Call the onAddNote callback with the new note
    onAddNote(newNote);

    // Reset form and close dialog
    setNoteContent("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note Content</Label>
              <Textarea
                id="note"
                placeholder="Enter your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Note</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
