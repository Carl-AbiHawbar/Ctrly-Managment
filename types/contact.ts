export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  notes?: string
  avatar: string
  createdAt: string
  updatedAt: string
}
