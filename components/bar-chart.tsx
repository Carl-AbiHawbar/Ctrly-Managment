"use client"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Alex M.", completed: 11, total: 18 },
  { name: "Jessica C.", completed: 15, total: 24 },
  { name: "Ryan P.", completed: 11, total: 14 },
  { name: "Sarah J.", completed: 12, total: 20 },
  { name: "David K.", completed: 11, total: 16 },
]

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" fillOpacity={0.2} />
        <Bar dataKey="completed" fill="#82ca9d" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
