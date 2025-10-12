"use client";

import { useState } from "react";

// ✅ Use the same sidebar/topbar you use everywhere else
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/Shared/Topbar";

// Your calendar view component
import SimpleCalendarView from "./Simplecalendarview";

// Optional: toaster if you use toasts on this page
import { Toaster } from "@/components/ui/toaster";

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If you want to wire these to header controls later:
  // const [view, setView] = useState<"month" | "week" | "day">("month");
  // const [filterProject, setFilterProject] = useState<string | null>(null);
  // const [filterAssignee, setFilterAssignee] = useState<string | null>(null);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content area (exact same shell as other pages) */}
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <Topbar
          name="Calendar"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50 p-3 lg:p-6">
          <SimpleCalendarView view="month" filterProject={null} filterAssignee={null} />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
