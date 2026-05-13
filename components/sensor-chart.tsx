"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorReading } from "@/types"

interface SensorChartProps {
  title: string
  data: SensorReading[]
  dataKey: string
  color: string
  unit: string
  limits?: {
    min: number
    max: number
    warningMin: number
    warningMax: number
  }
}

export function SensorChart({
  title,
  data,
  dataKey,
  color,
  unit,
  limits,
}: SensorChartProps) {
  const chartData = data.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    [dataKey]: reading.value,
    fullTime: new Date(reading.timestamp).toLocaleString("pt-BR"),
  }))

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}${unit}`}
                domain={limits ? [limits.min, limits.max] : ["auto", "auto"]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
                        <p className="text-xs text-muted-foreground">
                          {data.fullTime}
                        </p>
                        <p className="font-medium text-foreground">
                          {payload[0].value?.toString()}
                          {unit}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />

              {/* Linhas de referência para limites */}
              {limits && (
                <>
                  <ReferenceLine
                    y={limits.warningMax}
                    stroke="hsl(var(--warning))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    y={limits.warningMin}
                    stroke="hsl(var(--warning))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    y={limits.max}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <ReferenceLine
                    y={limits.min}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}

              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: color,
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda dos limites */}
        {limits && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-[hsl(var(--warning))]" style={{ backgroundImage: "repeating-linear-gradient(to right, hsl(var(--warning)) 0, hsl(var(--warning)) 3px, transparent 3px, transparent 5px)" }} />
              <span>Atenção</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 bg-[hsl(var(--destructive))]" style={{ backgroundImage: "repeating-linear-gradient(to right, hsl(var(--destructive)) 0, hsl(var(--destructive)) 2px, transparent 2px, transparent 4px)" }} />
              <span>Crítico</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
