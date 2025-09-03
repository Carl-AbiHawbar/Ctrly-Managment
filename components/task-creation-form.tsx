"use client";

import type React from "react";

import { useState } from "react";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface TaskCreationFormProps {
  status: TaskStatus;
  onTaskCreated: (task: Task) => void;
  trigger?: React.ReactNode;
}

// Sample data for projects and team members
const projects = [
  { id: "figma", name: "Figma Design System" },
  { id: "mobile", name: "Mobile App Development" },
  { id: "website", name: "Website Redesign" },
  { id: "marketing", name: "Marketing Campaign" },
];

const teamMembers = [
  { id: "user-1", name: "Alex Morgan", avatar: "/avatars/alex-morgan.png" },
  { id: "user-2", name: "Jessica Chen", avatar: "/avatars/jessica-chen.png" },
  { id: "user-3", name: "Ryan Park", avatar: "/avatars/ryan-park.png" },
  { id: "user-4", name: "Sarah Johnson", avatar: "/avatars/sarah-johnson.png" },
  { id: "user-5", name: "David Kim", avatar: "/avatars/david-kim.png" },
];

export default function TaskCreationForm({
  status,
  onTaskCreated,
  trigger,
}: TaskCreationFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
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
    priority: "medium" as TaskPriority,
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

  const resetForm = () => {
    setFormData({
      title: "",
      project: "",
      priority: "medium",
      description: "",
    });
    setDate(undefined);
    setSelectedAssignees([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.project || !date) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // const selectedProject = projects.find((p) => p.id === formData.project);

    // Create new task
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      project:
        projects.find((p) => p.id === formData.project)?.name ||
        formData.project,
      priority: formData.priority,
      status,
      dueDate: date.toISOString(),
      attachments: 0,
      comments: 0,
      subtasks: { completed: 0, total: 0 },
      assignees: selectedAssignees.map((a) => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
      })),
    };

    // Add the task
    onTaskCreated(newTask);

    // Show success toast
    toast({
      title: "✅ New project added successfully!",
      description: `"${formData.title}" has been added to ${status.replace(
        "-",
        " "
      )}.`,
    });

    // Reset form and close dialog
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 justify-start"
          >
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Task
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to the {status.replace("-", " ")} column.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="required">
                Project Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project" className="required">
                Project Type
              </Label>
              <Select
                value={formData.project}
                onValueChange={(value) => handleSelectChange("project", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <RadioGroup
                defaultValue="medium"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-green-600">
                    Low
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-blue-600">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-red-600">
                    High
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate" className="required">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ?  `${selected.toLocaleDateString()}` : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DayPicker
                    animate
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    footer={
                      selected
                        ? `Selected: ${selected.toLocaleDateString()}`
                        : "Pick a day."
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={handleInputChange}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Assignees</Label>
              <Popover open={assigneesOpen} onOpenChange={setAssigneesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={assigneesOpen}
                    className="w-full justify-between"
                  >
                    {selectedAssignees.length > 0
                      ? `${selectedAssignees.length} team member${
                          selectedAssignees.length > 1 ? "s" : ""
                        } selected`
                      : "Select team members"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
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
                <div className="flex flex-wrap gap-2 mt-2">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
