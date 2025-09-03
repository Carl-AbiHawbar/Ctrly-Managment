"use client";
import DashboardMyTasks from "@/components/dashboard-my-tasks";
import Topbar from "@/components/Shared/Topbar";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function MyTasksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 pt-16">
        <Topbar
          name="My Tasks"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <DashboardMyTasks />
      </div>
    </div>
  );
}
