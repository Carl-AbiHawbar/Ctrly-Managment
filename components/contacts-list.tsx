"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Building2,
  MoreHorizontal,
  Star,
  Trash,
  Edit,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type { Contact } from "@/types/contact";
import ContactForm from "./contact-form";
import Link from "next/link";

interface ContactsListProps {
  viewMode: "grid" | "list";
  filterTag: string | null;
  searchQuery: string;
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

// Sample contacts data
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

export default function ContactsList({
  viewMode,
  filterTag,
  searchQuery,
}: ContactsListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [filteredContacts, setFilteredContacts] =
    useState<Contact[]>(initialContacts);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...contacts];

    if (filterTag) {
      filtered = filtered.filter((contact) => contact.tags.includes(filterTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.company?.toLowerCase().includes(query) ||
          contact.position?.toLowerCase().includes(query)
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, filterTag, searchQuery]);

  // Handle contact creation
  const handleContactCreated = (newContact: Contact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
    toast({
      title: "Contact added",
      description: `${newContact.name} has been added to your contacts.`,
    });
  };

  // Handle contact update
  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
    toast({
      title: "Contact updated",
      description: `${updatedContact.name} has been updated.`,
    });
  };

  // Handle contact deletion
  const handleContactDeleted = (contactId: string) => {
    const contactToDelete = contacts.find((c) => c.id === contactId);
    if (contactToDelete) {
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactId)
      );
      toast({
        title: "Contact deleted",
        description: `${contactToDelete.name} has been removed from your contacts.`,
      });
    }
  };

  // Handle edit contact
  const handleEditContact = (contact: Contact) => {
    setEditContact(contact);
    setIsEditFormOpen(true);
  };

  if (filteredContacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No contacts found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or add a new contact.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => handleEditContact(contact)}
              onDelete={() => handleContactDeleted(contact.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Position
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Tags
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    onEdit={() => handleEditContact(contact)}
                    onDelete={() => handleContactDeleted(contact.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Contact Form */}
      {editContact && (
        <ContactForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          contact={editContact}
          onContactUpdated={handleContactUpdated}
        />
      )}
    </div>
  );
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col items-center p-6 pb-4">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage
              src={contact.avatar || "/placeholder.svg"}
              alt={contact.name}
            />
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-center">{contact.name}</h3>
          <p className="text-sm text-gray-500 text-center">
            {contact.position}
          </p>
          <p className="text-sm text-gray-500 text-center">{contact.company}</p>
        </div>

        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1 mb-4 justify-center">
            {contact.tags.map((tagId) => {
              const tag = contactTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  variant="outline"
                  className="flex items-center gap-1 pl-2"
                >
                  <div className={`h-2 w-2 rounded-full ${tag.color}`}></div>
                  {tag.name}
                </Badge>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-600 truncate">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{contact.phone}</span>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-600">{contact.company}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex border-t border-gray-100">
          <Link
            href={`/contacts/${contact.id}`}
            className="flex-1 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Details
          </Link>
          <div className="border-l border-gray-100"></div>
          <ContactActions
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContactRow({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 whitespace-nowrap">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage
              src={contact.avatar || "/placeholder.svg"}
              alt={contact.name}
            />
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{contact.name}</div>
            {contact.phone && (
              <div className="text-xs text-gray-500">{contact.phone}</div>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-900">{contact.email}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-900">{contact.company || "-"}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-900">{contact.position || "-"}</div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((tagId) => {
            const tag = contactTags.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <Badge
                key={tagId}
                variant="outline"
                className="flex items-center gap-1 pl-2"
              >
                <div className={`h-2 w-2 rounded-full ${tag.color}`}></div>
                <span className="text-xs">{tag.name}</span>
              </Badge>
            );
          })}
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/contacts/${contact.id}`}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
          <ContactActions
            contact={contact}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}

function ContactActions({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Contact actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Contact Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/contacts/${contact.id}`}
            className="flex items-center cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            <span>View Details</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          <span>Edit Contact</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="h-4 w-4 mr-2" />
          <span>Add to Favorites</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-2" />
          <span>Delete Contact</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Helper function to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}
