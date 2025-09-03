export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  project: string
  projectName: string
  location: string
  description: string
  assignees: {
    id: string
    name: string
    avatar: string
  }[]
  color: string
}
