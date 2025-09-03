"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import type { Contact } from "@/types/contact";
import ContactForm from "./contact-form";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Edit,
  Trash,
  Star,
  MessageSquare,
  FileText,
  Menu,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import RecentActivity from "./recent-activity";
import NotesTab from "./NotesTab";

interface ContactDetailPageProps {
  id: string;
}

// Sample tags for contacts
const contactTags = [
  { id: "team", name: "Team", color: "bg-blue-500" },
  { id: "client", name: "Client", color: "bg-green-500" },
  { id: "vendor", name: "Vendor", color: "bg-yellow-500" },
  { id: "partner", name: "Partner", color: "bg-purple-500" },
  { id: "lead", name: "Lead", color: "bg-red-500" },
  { id: "personal", name: "Personal", color: "bg-gray-500" },
];

// Sample contacts data (same as in contacts-list.tsx)
const initialContacts: Contact[] = [
  {
    id: "contact-1",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Inc.",
    position: "UI/UX Designer",
    tags: ["team"],
    notes: "Lead designer for the Figma Design System project.",
    avatar: "/avatars/alex-morgan.png",
    createdAt: "2023-01-15T08:30:00.000Z",
    updatedAt: "2023-05-20T14:45:00.000Z",
  },
  {
    id: "contact-2",
    name: "Jessica Chen",
    email: "jessica.chen@example.com",
    phone: "+1 (555) 234-5678",
    company: "TechCorp",
    position: "Frontend Developer",
    tags: ["team", "partner"],
    notes: "Working on the React component library.",
    avatar: "/avatars/jessica-chen.png",
    createdAt: "2023-02-10T10:15:00.000Z",
    updatedAt: "2023-06-05T09:30:00.000Z",
  },
  {
    id: "contact-3",
    name: "Ryan Park",
    email: "ryan.park@example.com",
    phone: "+1 (555) 345-6789",
    company: "StaticMania",
    position: "Product Manager",
    tags: ["client"],
    notes: "Client contact for the website redesign project.",
    avatar: "/avatars/ryan-park.png",
    createdAt: "2023-03-05T11:45:00.000Z",
    updatedAt: "2023-06-15T16:20:00.000Z",
  },
  {
    id: "contact-4",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 456-7890",
    company: "DataViz Corp",
    position: "Backend Developer",
    tags: ["team", "lead"],
    notes: "Leading the API development team.",
    avatar: "/avatars/sarah-johnson.png",
    createdAt: "2023-03-20T09:00:00.000Z",
    updatedAt: "2023-07-01T13:10:00.000Z",
  },
  {
    id: "contact-5",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 567-8901",
    company: "QA Solutions",
    position: "QA Engineer",
    tags: ["vendor"],
    notes: "External QA consultant for the mobile app project.",
    avatar: "/avatars/david-kim.png",
    createdAt: "2023-04-12T14:30:00.000Z",
    updatedAt: "2023-07-10T11:25:00.000Z",
  },
  {
    id: "contact-6",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 678-9012",
    company: "Marketing Experts",
    position: "Marketing Director",
    tags: ["client", "partner"],
    notes: "Client contact for the marketing campaign project.",
    avatar: "/emily-rodriguez.png",
    createdAt: "2023-05-05T10:45:00.000Z",
    updatedAt: "2023-07-15T15:30:00.000Z",
  },
  {
    id: "contact-7",
    name: "Michael Wong",
    email: "michael.wong@example.com",
    phone: "+1 (555) 789-0123",
    company: "FinTech Solutions",
    position: "Financial Analyst",
    tags: ["personal"],
    notes: "Personal contact from networking event.",
    avatar: "/michael-wong-portrait.png",
    createdAt: "2023-05-20T16:15:00.000Z",
    updatedAt: "2023-07-20T09:45:00.000Z",
  },
  {
    id: "contact-8",
    name: "Olivia Martinez",
    email: "olivia.martinez@example.com",
    phone: "+1 (555) 890-1234",
    company: "Design Studio",
    position: "Creative Director",
    tags: ["lead"],
    notes: "Potential lead for future design projects.",
    avatar: "/olivia-martinez.png",
    createdAt: "2023-06-10T13:20:00.000Z",
    updatedAt: "2023-07-25T14:15:00.000Z",
  },
];

export default function ContactDetailPage({ id }: ContactDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch contact details
    const fetchContact = async () => {
      setLoading(true);
      // In a real app, you would fetch from an API
      const foundContact = initialContacts.find((c) => c.id === id);

      if (foundContact) {
        setContact(foundContact);
      } else {
        // Handle not found
        router.push("/contacts");
      }

      setLoading(false);
    };

    fetchContact();
  }, [id, router]);

  // Handle contact update
  const handleContactUpdated = (updatedContact: Contact) => {
    setContact(updatedContact);
    toast({
      title: "Contact updated",
      description: `${updatedContact.name} has been updated.`,
    });
  };

  // Handle contact deletion
  const handleContactDeleted = () => {
    if (contact) {
      toast({
        title: "Contact deleted",
        description: `${contact.name} has been removed from your contacts.`,
      });
      router.push("/contacts");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return null; // Router will redirect
  }

  return (
    <div className=" bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="lg:w-[calc(100%-16rem)] lg:ml-64 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => router.push("/contacts")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:block"> Back to Contacts</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditFormOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:block">Edit Contact</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={handleContactDeleted}
              >
                <Trash className="h-4 w-4 mr-2" />
                <span className="hidden sm:block">Delete</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Contact Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Avatar className="size-16 md:h-20 md:w-20 mr-3 md:mr-6">
                <AvatarImage
                  src={contact.avatar || "/placeholder.svg"}
                  alt={contact.name}
                />
                <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {contact.name}
                </h1>
                <div className="flex flex-wrap gap-1 items-center mt-1">
                  {contact.position && (
                    <p className="text-gray-500">
                      {contact.position}
                      {contact.company && " at "}
                    </p>
                  )}
                  {contact.company && (
                    <p className="text-gray-500 font-medium">
                      {contact.company}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {contact.tags.map((tagId) => {
                    const tag = contactTags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={tagId}
                        variant="outline"
                        className="flex items-center gap-1 pl-2"
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${tag.color}`}
                        ></div>
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="hidden md:flex  flex-col items-start md:items-end mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className={`mb-2 ${
                  isFavorite
                    ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                    : ""
                }`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                Add to Favorites
              </Button>
              <Button variant="outline" size="sm">
                <Link href="/messages" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="overview">
            <TabsList className="flex flex-wrap justify-start gap-2 mb-6 h-full w-full md:w-max">
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Calendar className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="notes">
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Basic information about the contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Email
                        </h4>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      </div>

                      {contact.phone && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Phone
                          </h4>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {contact.company && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Company
                          </h4>
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{contact.company}</span>
                          </div>
                        </div>
                      )}

                      {contact.position && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">
                            Position
                          </h4>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{contact.position}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map((tagId) => {
                        const tag = contactTags.find((t) => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tagId}
                            variant="outline"
                            className="flex items-center gap-1 pl-2"
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${tag.color}`}
                            ></div>
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {contact.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Notes
                        </h4>
                        <p className="text-gray-700">{contact.notes}</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Created
                      </h4>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {format(new Date(contact.createdAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </h4>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {format(new Date(contact.updatedAt), "MMMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest interactions with this contact
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>
                    History of interactions with this contact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity showAll />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <NotesTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Edit Contact Form */}
      <ContactForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        contact={contact}
        onContactUpdated={handleContactUpdated}
      />
    </div>
  );
}

// Helper function to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}
