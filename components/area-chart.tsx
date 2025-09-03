"use client"
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { name: "Jan", tasks: 40, completed: 24 },
  { name: "Feb", tasks: 30, completed: 13 },
  { name: "Mar", tasks: 20, completed: 8 },
  { name: "Apr", tasks: 27, completed: 15 },
  { name: "May", tasks: 18, completed: 12 },
  { name: "Jun", tasks: 23, completed: 19 },
  { name: "Jul", tasks: 34, completed: 24 },
  { name: "Aug", tasks: 35, completed: 25 },
  { name: "Sep", tasks: 45, completed: 32 },
  { name: "Oct", tasks: 50, completed: 38 },
  { name: "Nov", tasks: 40, completed: 30 },
  { name: "Dec", tasks: 35, completed: 25 },
]

export function AreaChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="tasks" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.2} />
        <Area type="monotone" dataKey="completed" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
