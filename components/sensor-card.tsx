"use client"

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SensorCardProps {
  title: string
  icon: LucideIcon
  value: number
  unit: string
  status: "normal" | "warning" | "critical"
  trend: "increasing" | "decreasing" | "stable"
  onClick?: () => void
  isSelected?: boolean
}

export function SensorCard({
  title,
  icon: Icon,
  value,
  unit,
  status,
  trend,
  onClick,
  isSelected,
}: SensorCardProps) {
  const statusConfig = {
    normal: {
      bg: "bg-[oklch(0.25_0.05_145)]",
      border: "border-[oklch(0.45_0.15_145)]",
      text: "text-[oklch(0.75_0.15_145)]",
      label: "Normal",
    },
    warning: {
      bg: "bg-[oklch(0.25_0.05_80)]",
      border: "border-[oklch(0.6_0.15_80)]",
      text: "text-[oklch(0.8_0.15_80)]",
      label: "Atenção",
    },
    critical: {
      bg: "bg-[oklch(0.25_0.08_25)]",
      border: "border-[oklch(0.5_0.2_25)]",
      text: "text-[oklch(0.7_0.2_25)]",
      label: "Crítico",
    },
  }

  const TrendIcon =
    trend === "increasing"
      ? TrendingUp
      : trend === "decreasing"
        ? TrendingDown
        : Minus

  const config = statusConfig[status]

  return (
    <Card
      className={cn(
        "cursor-pointer border-2 transition-all hover:shadow-lg",
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
        config.border
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", config.bg)}>
              <Icon className={cn("h-5 w-5", config.text)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {value.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                config.bg,
                config.text
              )}
            >
              {config.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendIcon className="h-3 w-3" />
              <span>
                {trend === "increasing"
                  ? "Subindo"
                  : trend === "decreasing"
                    ? "Descendo"
                    : "Estável"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
