"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Contact } from "@/types/contact"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ContactFormProps {
  isOpen: boolean
  onClose: () => void
  contact?: Contact
  onContactCreated?: (contact: Contact) => void
  onContactUpdated?: (contact: Contact) => void
}

// Sample tags for contacts
const contactTags = [
  { id: "team", name: "Team", color: "bg-blue-500" },
  { id: "client", name: "Client", color: "bg-green-500" },
  { id: "vendor", name: "Vendor", color: "bg-yellow-500" },
  { id: "partner", name: "Partner", color: "bg-purple-500" },
  { id: "lead", name: "Lead", color: "bg-red-500" },
  { id: "personal", name: "Personal", color: "bg-gray-500" },
]

export default function ContactForm({
  isOpen,
  onClose,
  contact,
  onContactCreated,
  onContactUpdated,
}: ContactFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState(contact?.name || "")
  const [email, setEmail] = useState(contact?.email || "")
  const [phone, setPhone] = useState(contact?.phone || "")
  const [company, setCompany] = useState(contact?.company || "")
  const [position, setPosition] = useState(contact?.position || "")
  const [tags, setTags] = useState<string[]>(contact?.tags || [])
  const [notes, setNotes] = useState(contact?.notes || "")
  const [newTag, setNewTag] = useState("")

  const handleAddTag = (tagId: string) => {
    if (!tags.includes(tagId)) {
      setTags([...tags, tagId])
    }
    setNewTag("")
  }

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter((t) => t !== tagId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const contactData: Contact = {
      id: contact?.id || `contact-${Date.now()}`,
      name,
      email,
      phone,
      company,
      position,
      tags,
      notes,
      avatar: contact?.avatar || `/placeholder.svg?height=128&width=128&query=${encodeURIComponent(name)}`,
      createdAt: contact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (contact && onContactUpdated) {
      onContactUpdated(contactData)
      toast({
        title: "Contact updated",
        description: `${name} has been updated successfully.`,
      })
    } else if (onContactCreated) {
      onContactCreated(contactData)
      toast({
        title: "Contact created",
        description: `${name} has been added to your contacts.`,
      })
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="required">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="required">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Enter job position"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center space-x-2">
              <Select value={newTag} onValueChange={handleAddTag}>
                <SelectTrigger id="tags" className="w-full">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  {contactTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id} disabled={tags.includes(tag.id)}>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${tag.color} mr-2`}></div>
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tagId) => {
                const tag = contactTags.find((t) => t.id === tagId)
                if (!tag) return null
                return (
                  <Badge key={tagId} variant="outline" className="flex items-center gap-1 pl-2">
                    <div className={`h-2 w-2 rounded-full ${tag.color}`}></div>
                    {tag.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 rounded-full"
                      onClick={() => handleRemoveTag(tagId)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                )
              })}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{contact ? "Update Contact" : "Add Contact"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
