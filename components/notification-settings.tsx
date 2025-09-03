"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

interface NotificationSettingsProps {
  onClose: () => void
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Notification Settings</DialogTitle>
              <X className="h-4 w-4" />
          </div>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <div className="px-4 border-b">
            <TabsList className="h-12">
              <TabsTrigger value="email" className="data-[state=active]:bg-blue-50">
                Email
              </TabsTrigger>
              <TabsTrigger value="push" className="data-[state=active]:bg-blue-50">
                Push
              </TabsTrigger>
              <TabsTrigger value="in-app" className="data-[state=active]:bg-blue-50">
                In-App
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <TabsContent value="email" className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications</p>
                  </div>
                  <Switch defaultChecked id="email-notifications" />
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Email Frequency</h4>
                  <RadioGroup defaultValue="immediate">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate">Immediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly digest</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-tasks" className="flex-1">
                      Task assignments and updates
                    </Label>
                    <Switch defaultChecked id="email-tasks" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-mentions" className="flex-1">
                      Mentions and comments
                    </Label>
                    <Switch defaultChecked id="email-mentions" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-projects" className="flex-1">
                      Project updates
                    </Label>
                    <Switch defaultChecked id="email-projects" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-system" className="flex-1">
                      System notifications
                    </Label>
                    <Switch defaultChecked id="email-system" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="push" className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
                  </div>
                  <Switch defaultChecked id="push-notifications" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-tasks" className="flex-1">
                      Task assignments and updates
                    </Label>
                    <Switch defaultChecked id="push-tasks" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-mentions" className="flex-1">
                      Mentions and comments
                    </Label>
                    <Switch defaultChecked id="push-mentions" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-projects" className="flex-1">
                      Project updates
                    </Label>
                    <Switch defaultChecked id="push-projects" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-system" className="flex-1">
                      System notifications
                    </Label>
                    <Switch defaultChecked id="push-system" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="in-app" className="p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">In-App Notifications</h3>
                    <p className="text-sm text-gray-500">Manage notifications within the app</p>
                  </div>
                  <Switch defaultChecked id="in-app-notifications" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-tasks" className="flex-1">
                      Task assignments and updates
                    </Label>
                    <Switch defaultChecked id="in-app-tasks" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-mentions" className="flex-1">
                      Mentions and comments
                    </Label>
                    <Switch defaultChecked id="in-app-mentions" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-projects" className="flex-1">
                      Project updates
                    </Label>
                    <Switch defaultChecked id="in-app-projects" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="in-app-system" className="flex-1">
                      System notifications
                    </Label>
                    <Switch defaultChecked id="in-app-system" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Display Options</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-notifications" className="flex-1">
                      Sound notifications
                    </Label>
                    <Switch id="sound-notifications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktop-notifications" className="flex-1">
                      Desktop notifications
                    </Label>
                    <Switch defaultChecked id="desktop-notifications" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="badge-count" className="flex-1">
                      Show badge count
                    </Label>
                    <Switch defaultChecked id="badge-count" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleClose}>Save Changes</Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
