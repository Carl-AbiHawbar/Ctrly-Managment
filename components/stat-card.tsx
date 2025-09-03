import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  changeText: string
  icon: React.ElementType
  trend: "up" | "down" | "neutral"
}

export function StatCard({ title, value, change, changeText, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-gray-600",
            )}
          >
            {trend === "up" && <ArrowUpRight className="h-4 w-4 mr-1" />}
            {trend === "down" && <ArrowDownRight className="h-4 w-4 mr-1" />}
            {change}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{changeText}</p>
        </div>
      </CardContent>
    </Card>
  )
}
