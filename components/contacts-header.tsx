"use client";

import { Menu, Plus, Search, Tag, LayoutGrid, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import ContactForm from "./contact-form";
import Topbar from "./Shared/Topbar";

interface ContactsHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filterTag: string | null;
  onFilterTagChange: (tag: string | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

// Sample tags for filtering
const contactTags = [
  { id: "team", name: "Team", color: "bg-blue-500" },
  { id: "client", name: "Client", color: "bg-green-500" },
  { id: "vendor", name: "Vendor", color: "bg-yellow-500" },
  { id: "partner", name: "Partner", color: "bg-purple-500" },
  { id: "lead", name: "Lead", color: "bg-red-500" },
  { id: "personal", name: "Personal", color: "bg-gray-500" },
];

export default function ContactsHeader({
  sidebarOpen,
  setSidebarOpen,
  viewMode,
  onViewModeChange,
  filterTag,
  onFilterTagChange,
  searchQuery,
  onSearchQueryChange,
}: ContactsHeaderProps) {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 fixed w-full lg:w-[calc(100%-16rem)] top-0 z-10">
      <Topbar
        name="Contact"
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Filters Bar */}
      <div className="border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search contacts..."
                className="pl-8 h-9 w-full sm:w-64 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Tag className="h-4 w-4 mr-2" />
                  {filterTag
                    ? contactTags.find((t) => t.id === filterTag)?.name
                    : "All Contacts"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilterTagChange(null)}>
                  <span className={cn(filterTag === null && "font-medium")}>
                    All Contacts
                  </span>
                </DropdownMenuItem>
                {contactTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={() => onFilterTagChange(tag.id)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-2 w-2 rounded-full ${tag.color} mr-2`}
                      ></div>
                      <span
                        className={cn(filterTag === tag.id && "font-medium")}
                      >
                        {tag.name}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-gray-100 rounded-lg p-1 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium",
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                onClick={() => onViewModeChange("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-sm font-medium",
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                onClick={() => onViewModeChange("list")}
              >
                <ListIcon className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Dialog */}
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
      />
    </div>
  );
}
