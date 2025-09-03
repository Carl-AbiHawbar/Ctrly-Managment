"use client"

import type React from "react"

import { AppSidebar } from "./app-sidebar"

export default function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
