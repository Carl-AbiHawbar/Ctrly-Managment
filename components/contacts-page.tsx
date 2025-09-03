"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import ContactsHeader from "./contacts-header";
import ContactsList from "./contacts-list";
import { Toaster } from "@/components/ui/toaster";

export default function ContactsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className=" bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col overflow-hidden pt-16">
        <ContactsHeader
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filterTag={filterTag}
          onFilterTagChange={setFilterTag}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 lg:p-6">
          <ContactsList
            viewMode={viewMode}
            filterTag={filterTag}
            searchQuery={searchQuery}
          />
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
