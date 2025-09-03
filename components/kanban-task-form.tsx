"use client";
import type React from "react";
import { useState } from "react";
import { CalendarIcon, Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { KanbanTask, KanbanStatus } from "@/types/kanban";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";


interface KanbanTaskFormProps {
  status: KanbanStatus;
  onTaskCreated: (task: KanbanTask) => void;
  onCancel: () => void;
}

// Sample data for projects and team members
const projects = [
  { id: "figma", name: "Figma Design System" },
  { id: "react", name: "Keep React" },
  { id: "static", name: "StaticMania" },
  { id: "mobile", name: "Mobile App Development" },
  { id: "ecommerce", name: "E-commerce Platform" },
  { id: "analytics", name: "Analytics Dashboard" },
];

const teamMembers = [
  { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
  { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
  { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
  { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
  { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
];

export default function KanbanTaskForm({
  status,
  onTaskCreated,
  onCancel,
}: KanbanTaskFormProps) {
  const [date, setDate] = useState<Date>();
  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<
    typeof teamMembers
  >([]);
  const [selected, setSelected] = useState<Date>();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    project: "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAssignee = (member: (typeof teamMembers)[0]) => {
    setSelectedAssignees((prev) => {
      const isSelected = prev.some((a) => a.id === member.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.project || !date) {
      // Show error
      return;
    }

    const selectedProject = projects.find((p) => p.id === formData.project);

    // Create new task
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: formData.title,
      project: formData.project,
      projectName: selectedProject?.name || "",
      priority: formData.priority,
      status,
      dueDate: date.toISOString(),
      attachments: 0,
      comments: 0,
      subtasks: { completed: 0, total: 0 },
      description: formData.description,
      assignees: selectedAssignees.map((a) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
      })),
    };

    // Add the task
    onTaskCreated(newTask);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        id="title"
        name="title"
        placeholder="Task title"
        value={formData.title}
        onChange={handleInputChange}
        className="border-gray-300"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={formData.project}
          onValueChange={(value) => handleSelectChange("project", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selected ? `${selected.toLocaleDateString()}` : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <DayPicker
              animate
              mode="single"
              selected={selected}
              onSelect={setSelected}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Priority</Label>
        <RadioGroup
          defaultValue="medium"
          value={formData.priority}
          onValueChange={(value) => handleSelectChange("priority", value)}
          className="flex space-x-2"
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="low" id="low" className="h-3 w-3" />
            <Label htmlFor="low" className="text-xs text-green-600">
              Low
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="medium" id="medium" className="h-3 w-3" />
            <Label htmlFor="medium" className="text-xs text-yellow-600">
              Medium
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="high" id="high" className="h-3 w-3" />
            <Label htmlFor="high" className="text-xs text-red-600">
              High
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Textarea
        id="description"
        name="description"
        placeholder="Task description"
        value={formData.description}
        onChange={handleInputChange}
        className="min-h-[60px] border-gray-300"
      />

      <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={assigneesOpen}
            className="justify-between w-full"
          >
            {selectedAssignees.length > 0
              ? `${selectedAssignees.length} assignee${
                  selectedAssignees.length > 1 ? "s" : ""
                }`
              : "Select assignees"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandList>
              <CommandEmpty>No team member found.</CommandEmpty>
              <CommandGroup>
                {teamMembers.map((member) => {
                  const isSelected = selectedAssignees.some(
                    (a) => a.id === member.id
                  );
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.name}
                      onSelect={() => toggleAssignee(member)}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAssignees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAssignees.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-1 bg-gray-100 rounded-full pl-1 pr-2 py-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => toggleAssignee(member)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Create Task
        </Button>
      </div>
    </form>
  );
}
