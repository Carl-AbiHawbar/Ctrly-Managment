"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import CalendarHeader from "./calendar-header";
import CalendarWrapper from "./calendar-wrapper";
import { Toaster } from "@/components/ui/toaster";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col overflow-hidden pt-16">
        <CalendarHeader
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          view={view}
          onViewChange={setView}
          filterProject={filterProject}
          onFilterProjectChange={setFilterProject}
          filterAssignee={filterAssignee}
          onFilterAssigneeChange={setFilterAssignee}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <CalendarWrapper
            view={view}
            filterProject={filterProject}
            filterAssignee={filterAssignee}
          />
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
