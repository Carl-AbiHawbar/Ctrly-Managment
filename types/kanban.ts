export type KanbanStatus = "backlog" | "todo" | "in-progress" | "in-review" | "done"
export type KanbanPriority = "low" | "medium" | "high"

export interface KanbanTask {
  id: string
  title: string
  project: string
  projectName: string
  priority: KanbanPriority
  status: KanbanStatus
  dueDate: string
  attachments: number
  comments: number
  subtasks: {
    completed: number
    total: number
  }
  description: string
  assignees: {
    id: string
    name: string
    avatar: string
  }[]
}
