import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Bell, LogOut, Menu, Plus, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Dispatch, SetStateAction } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NewProjectModal from "./NewProjectModal";
import Link from "next/link";

type topbarPropsT = {
  name: string;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

const Topbar = ({ name, sidebarOpen, setSidebarOpen }: topbarPropsT) => {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm fixed w-full lg:w-[calc(100%-16rem)] top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Menu Button (mobile) and Date/Greeting */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4 lg:hidden"
          >
            <Menu className="h-10 w-10" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        </div>

        {/* Right: Notifications, New Project Button and Profile */}
        <div className="flex items-center space-x-4">
          <Link href="/notifications"   className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-[-6px] -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Link>
          <NewProjectModal />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/avatars/william-jack.png"
                    alt="William Jack"
                  />
                  <AvatarFallback>WJ</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
