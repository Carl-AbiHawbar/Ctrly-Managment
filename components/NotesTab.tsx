"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AddNoteDialog from "./AddNoteDialog";

interface Note {
  id: string;
  content: string;
  author: string;
  date: string;
}

const notesData = [
  {
    id: "note-1",
    content: "Lead designer for the Figma Design System project.",
    author: "Sarah Johnson",
    date: "2023-05-20T10:30:00Z",
  },
];

export default function NotesTab() {
  const [notes, setNotes] = useState<Note[]>(notesData);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddNote = (note: {
    content: string;
    author: string;
    date: string;
  }) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      ...note,
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Notes</h2>
          <p className="text-sm text-gray-500">
            Notes and comments about this contact
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="border rounded-md p-4">
            <p className="text-gray-700">{note.content}</p>
            <div className="flex flex-wrap gap-2 justify-between items-center mt-4 text-sm text-gray-500">
              <span>Added by {note.author}</span>
              <span title={formatDate(note.date)}>
                {getRelativeTime(note.date)}
              </span>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-500 border rounded-md">
            No notes found. Add your first note!
          </div>
        )}
      </div>

      <AddNoteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
