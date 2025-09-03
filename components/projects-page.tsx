"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import ProjectsHeader from "./projects-header";
import ProjectsList from "./projects-list";
import { Toaster } from "@/components/ui/toaster";

export default function ProjectsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col pt-16">
        <ProjectsHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50 p-3 lg:p-6">
          <ProjectsList viewMode={viewMode} filterStatus={filterStatus} />
        </main>
      </div>
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
