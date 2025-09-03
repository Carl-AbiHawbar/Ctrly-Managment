export type NotificationType = "task" | "mention" | "project" | "system"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  sender?: {
    name: string
    avatar: string
  }
  timestamp: Date
  read: boolean
  relatedItemId?: string
  relatedItemType?: "task" | "project" | "comment" | "system"
}
