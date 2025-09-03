"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  Search,
  Settings,
  Phone,
  Video,
  Mail,
  MoreHorizontal,
  MapPin,
  Smile,
  PaperclipIcon,
  Send,
  Download,
  FileIcon,
  User,
  Bell,
  Lock,
  Palette,
  LogOut,
} from "lucide-react";
import Topbar from "@/components/Shared/Topbar";
import Sidebar from "@/components/sidebar";

import avatar1 from "@/public/avatars/alex-morgan.png";
import avatar2 from "@/public/avatars/david-kim.png";
import avatar3 from "@/public/avatars/alex-morgan.png";
import Image from "next/image";

export default function MessagePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 pt-[70px]">
        <Topbar
          name="Message"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-6 xl:col-span-8 border-r">
            {/* Header */}
            <div className="flex flex-wrap gap-2 items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <Image src={avatar1} alt="Darlene Robertson" />
                </Avatar>
                <span className="font-medium">Darlene Robertson</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    className="pl-9 pr-4 py-2 md:w-64 bg-gray-50"
                    placeholder="Search Message"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Privacy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Appearance</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Message 1 */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <Image src={avatar2} alt="User" />
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                    <p>Hey team! How are you all?</p>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>2:30 PM</span>
                    <div className="flex items-center ml-2 text-red-500">
                      <Heart className="h-4 w-4 fill-current" />
                      <span className="ml-1">3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message 2 with image */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <Image src={avatar3} alt="Darlene" />
                </Avatar>
                <div className="flex-1">
                  <div className="space-y-2 max-w-md">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <img
                        src="/placeholder.svg?key=abb3a"
                        alt="Document icons"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p>
                        Hey team! Just a heads-up, we're diving into the Figma
                        Design System integration project today.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>2:30 PM</span>
                    <div className="flex items-center ml-2 text-red-500">
                      <Heart className="h-4 w-4 fill-current" />
                      <span className="ml-1">3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message 3 - Blue message (from current user) */}
              <div className="flex justify-end gap-3">
                <div className="flex-1 flex flex-col items-end">
                  <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm max-w-md">
                    <p>
                      Hey Zakir, I want to make this type of workspace. Can you
                      help me?
                    </p>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>2:30 PM</span>
                  </div>
                </div>
                <Avatar className="h-10 w-10 mt-1">
                  <Image src={avatar3} alt="User" />
                </Avatar>
              </div>

              {/* Message 4 */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <Image src={avatar1} alt="Darlene" />
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                    <p>
                      That's great news! Should we set up a kick-off meeting to
                      discuss our approach?
                    </p>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>2:30 PM</span>
                  </div>
                </div>
              </div>
              {/* Message 5 */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 mt-1">
                  <Image src={avatar1} alt="Darlene" />
                </Avatar>
                <div className="flex-1">
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-md">
                    <p>
                      That's great news! Should we set up a kick-off meeting to
                      discuss our approach?
                    </p>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>2:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="ghost" size="icon">
                  <PaperclipIcon className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5 text-gray-600" />
                </Button>
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Profile & Media */}
          <div className="col-span-12 md:col-span-6 xl:col-span-4 bg-white flex flex-col">
            {/* Profile Section */}
            <div className="p-6 flex flex-col items-center border-b">
              <Avatar className="h-16 w-16 mb-3">
                <Image src={avatar1} alt="Darlene Robertson" />
              </Avatar>
              <h2 className="text-lg font-medium">Darlene Robertson</h2>
              <p className="text-sm text-gray-500 mb-4">24 minutes ago</p>

              <div className="flex gap-4 mb-6">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Video className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mail className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">(316) 555-0116</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">example@gmail.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 ">
                    4517 Washington Ave. Manchester, Kentucky 39495
                  </span>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  Media <span className="text-gray-500 text-sm">26</span>
                </h3>
                <Tabs defaultValue="files">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="files" className="text-xs">
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-xs">
                      Image
                    </TabsTrigger>
                    <TabsTrigger value="link" className="text-xs">
                      Link
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 p-2 rounded-md">
                        <FileIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Connecting your tech.pdf
                        </p>
                        <p className="text-xs text-gray-500">4.2MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-5 w-5 text-gray-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
