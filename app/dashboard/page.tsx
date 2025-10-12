"use client";
import Dashboard from "@/components/dashboard";
import Topbar from "@/components/Shared/Topbar";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

export default function dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <Dashboard />
    </div>
  );
}
