"use client";
import { useState } from "react";
import { NotificationsHeader } from "./notifications-header";
import { NotificationsList } from "./notifications-list";
import { NotificationDetail } from "./notification-detail";
import { NotificationSettings } from "./notification-settings";
import type { Notification } from "@/types/notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "./sidebar";
import Topbar from "./Shared/Topbar";

export function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Close detail view when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedNotification(null);
  };

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 pt-[70px]">
        <Topbar
          name="My Tasks"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 overflow-hidden">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={handleTabChange}
            className="h-full flex flex-wrap flex-col"
          >
            <div className="border-b">
              <TabsList className="h-full flex flex-wrap gap-2 justify-start px-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-blue-50"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-blue-50"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="mentions"
                  className="data-[state=active]:bg-blue-50"
                >
                  Mentions
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-blue-50"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="system"
                  className="data-[state=active]:bg-blue-50"
                >
                  System
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="all" className="h-full m-0 p-0">
                <div className="grid grid-cols-12 h-full">
                  <div
                    className={`${
                      selectedNotification
                        ? "col-span-12 md:col-span-6 lg:col-span-7"
                        : "col-span-12"
                    }  h-full overflow-y-auto`}
                  >
                    <NotificationsList
                      filter="all"
                      searchQuery={searchQuery}
                      onSelectNotification={setSelectedNotification}
                      selectedNotificationId={selectedNotification?.id}
                    />
                  </div>
                  {selectedNotification && (
                    <div className="col-span-12 md:col-span-6 lg:col-span-5 h-full border-l border-gray-200 overflow-y-auto">
                      <NotificationDetail
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="h-full m-0 p-0">
                <div className="flex h-full">
                  <div
                    className={`${
                      selectedNotification
                        ? "hidden md:block md:w-1/2 lg:w-3/5"
                        : "w-full"
                    } h-full overflow-y-auto`}
                  >
                    <NotificationsList
                      filter="task"
                      searchQuery={searchQuery}
                      onSelectNotification={setSelectedNotification}
                      selectedNotificationId={selectedNotification?.id}
                    />
                  </div>
                  {selectedNotification && (
                    <div className="w-full md:w-1/2 lg:w-2/5 h-full border-l border-gray-200 overflow-y-auto">
                      <NotificationDetail
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="mentions" className="h-full m-0 p-0">
                <div className="flex h-full">
                  <div
                    className={`${
                      selectedNotification
                        ? "hidden md:block md:w-1/2 lg:w-3/5"
                        : "w-full"
                    } h-full overflow-y-auto`}
                  >
                    <NotificationsList
                      filter="mention"
                      searchQuery={searchQuery}
                      onSelectNotification={setSelectedNotification}
                      selectedNotificationId={selectedNotification?.id}
                    />
                  </div>
                  {selectedNotification && (
                    <div className="w-full md:w-1/2 lg:w-2/5 h-full border-l border-gray-200 overflow-y-auto">
                      <NotificationDetail
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="projects" className="h-full m-0 p-0">
                <div className="flex h-full">
                  <div
                    className={`${
                      selectedNotification
                        ? "hidden md:block md:w-1/2 lg:w-3/5"
                        : "w-full"
                    } h-full overflow-y-auto`}
                  >
                    <NotificationsList
                      filter="project"
                      searchQuery={searchQuery}
                      onSelectNotification={setSelectedNotification}
                      selectedNotificationId={selectedNotification?.id}
                    />
                  </div>
                  {selectedNotification && (
                    <div className="w-full md:w-1/2 lg:w-2/5 h-full border-l border-gray-200 overflow-y-auto">
                      <NotificationDetail
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="system" className="h-full m-0 p-0">
                <div className="flex h-full">
                  <div
                    className={`${
                      selectedNotification
                        ? "hidden md:block md:w-1/2 lg:w-3/5"
                        : "w-full"
                    } h-full overflow-y-auto`}
                  >
                    <NotificationsList
                      filter="system"
                      searchQuery={searchQuery}
                      onSelectNotification={setSelectedNotification}
                      selectedNotificationId={selectedNotification?.id}
                    />
                  </div>
                  {selectedNotification && (
                    <div className="w-full md:w-1/2 lg:w-2/5 h-full border-l border-gray-200 overflow-y-auto">
                      <NotificationDetail
                        notification={selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {showSettings && (
          <NotificationSettings onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}
