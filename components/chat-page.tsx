"use client"

import LayoutWithSidebar from "./layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatPage() {
  return (
    <LayoutWithSidebar>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Chat</h1>

        <Card>
          <CardHeader>
            <CardTitle>Chat Messages</CardTitle>
            <CardDescription>Connect with your team members and collaborators</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chat functionality will be implemented here. You'll be able to send messages, create group chats, and
              share files with your team.
            </p>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}
