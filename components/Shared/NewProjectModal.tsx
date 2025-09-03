"use client";
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
import { Button } from "../ui/button";
import { Plus, Upload, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { useState } from "react";

import avatar1 from "@/public/avatars/alex-morgan.png";
import avatar2 from "@/public/avatars/david-kim.png";
import avatar3 from "@/public/avatars/ryan-park.png";
import Image, { StaticImageData } from "next/image";

const teamMembers = [
  {
    name: "Courtney Henry",
    role: "Data Analyst Lead",
    avatar: avatar1,
    permission: "Owner",
  },
  {
    name: "Cameron Williamson",
    role: "Software Engineer",
    avatar: avatar2,
    permission: "Editor",
  },
  {
    name: "Leslie Alexander",
    role: "UX Designer",
    avatar: avatar3,
    permission: "Viewer",
  },
];

const NewProjectModal = () => {
  const [projectName, setProjectName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hidden md:flex bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="hidden md:block w-full lg:max-w-[900px] h-full lg:h-max overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl lg:text-2xl">
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project.
          </DialogDescription>
        </DialogHeader>

        <div className="p-2 overflow-y-auto mt-5">
          <div className="grid grid-cols-12 gap-4 lg:gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-7">
              {/* Project Name */}
              <div className="space-y-2">
                <label
                  htmlFor="project-name"
                  className="block text-lg md:text-xl font-medium"
                >
                  Project name<span className="text-red-500">*</span>
                </label>
                <Input
                  id="project-name"
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              {/* Team Section */}
              <div className="mt-5">
                <h3 className="text-lg lg:text-xl font-medium mb-3">Team</h3>
                <div className="space-y-3">
                  {teamMembers.map(
                    (
                      {
                        name,
                        role,
                        avatar,
                        permission,
                      }: {
                        name: string;
                        role: string;
                        avatar: StaticImageData | string ;
                        permission: string;
                      },
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <Image src={avatar} alt={name} />
                            <AvatarFallback>
                              {name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-500">{role}</p>
                          </div>
                        </div>
                        <Select defaultValue={permission.toLowerCase()}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder={permission} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  )}
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Team Member</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-5">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="flex flex-wrap gap-2 w-max mb-4 ">
                  <TabsTrigger value="upload">Upload logo</TabsTrigger>
                  <TabsTrigger value="emoji">Emoji</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-0">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 h-40 relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-full"
                      />
                    ) : (
                      <>
                        <div className="rounded-full bg-gray-100 p-2 mb-2">
                          <Upload className="h-5 w-5 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium">
                          Upload project logo
                        </p>
                        <p className="text-xs text-gray-500">
                          Min 600x600, PNG or JPEG
                        </p>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="emoji" className="mt-0">
                  <div className="h-40 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "😀",
                        "😃",
                        "😄",
                        "😁",
                        "😆",
                        "😅",
                        "😂",
                        "🤣",
                        "😊",
                        "😇",
                        "🙂",
                        "🙃",
                        "😉",
                        "😌",
                        "😍",
                        "🥰",
                        "😘",
                        "😗",
                        "😙",
                        "😚",
                        "👍",
                        "👎",
                        "👏",
                        "🙌",
                        "👐",
                        "🤲",
                        "🤝",
                        "🙏",
                        "✌️",
                        "🤟",
                        "🧠",
                        "👀",
                        "👁️",
                        "👄",
                        "👅",
                      ].map((emoji, index) => (
                        <div
                          key={index}
                          className="aspect-square flex items-center justify-center text-2xl p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end mt-4 lg:mt-8">
                <Button variant="outline">Update</Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start gap-2 mt-4">
          <Button type="submit">Create</Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
