"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Props for the chart component
interface ChartProps {
  data: any[]
  type: "bar" | "line" | "pie" | "area"
  title: string
  height?: number
  dataKeys: string[]
  colors?: string[]
  xAxisKey?: string
  stacked?: boolean
  formatter?: (value: number) => string
  pieNameKey?: string
  pieValueKey?: string
}

// Memoized chart component for better performance
export const DashboardChart = ({
  data,
  type,
  title,
  height = 300,
  dataKeys,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
  xAxisKey = "name",
  stacked = false,
  formatter,
  pieNameKey = "name",
  pieValueKey = "value",
}: ChartProps) => {
  // Memoize the chart content to prevent unnecessary re-renders
  const chartContent = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      )
    }

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={formatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={formatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={pieValueKey}
                nameKey={pieNameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatter} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                {dataKeys.map((key, index) => (
                  <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip formatter={formatter} />
              <Legend />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#color${key})`}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }, [data, type, dataKeys, xAxisKey, colors, formatter, stacked, pieNameKey, pieValueKey])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: height }}>{chartContent}</div>
      </CardContent>
    </Card>
  )
}

