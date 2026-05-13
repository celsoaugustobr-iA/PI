"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SensorStatistics } from "@/types"

interface StatsPanelProps {
  statistics: Record<string, SensorStatistics>
}

export function StatsPanel({ statistics }: StatsPanelProps) {
  const sensorLabels: Record<string, string> = {
    humidity: "Umidade",
    accelerometer: "Acelerômetro",
    vibration: "Vibração",
  }

  const sensorUnits: Record<string, string> = {
    humidity: "%",
    accelerometer: "g",
    vibration: "mm/s",
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <BarChart3 className="h-4 w-4" />
          Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="humidity" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            {Object.keys(statistics).map((key) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {sensorLabels[key] || key}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(statistics).map(([key, stats]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Média"
                  value={stats.average}
                  unit={sensorUnits[key]}
                />
                <StatCard
                  label="Mínimo"
                  value={stats.min}
                  unit={sensorUnits[key]}
                  variant="min"
                />
                <StatCard
                  label="Máximo"
                  value={stats.max}
                  unit={sensorUnits[key]}
                  variant="max"
                />
                <StatCard
                  label="Desvio Padrão"
                  value={stats.standardDeviation}
                  unit={sensorUnits[key]}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Tendência */}
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Tendência
                  </p>
                  <div className="flex items-center gap-2">
                    {stats.trend === "increasing" ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-[oklch(0.7_0.2_25)]" />
                        <span className="font-medium text-[oklch(0.7_0.2_25)]">
                          Subindo
                        </span>
                      </>
                    ) : stats.trend === "decreasing" ? (
                      <>
                        <TrendingDown className="h-5 w-5 text-[oklch(0.65_0.2_220)]" />
                        <span className="font-medium text-[oklch(0.65_0.2_220)]">
                          Descendo
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-muted-foreground">
                          Estável
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Percentis */}
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Percentis
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">P25: </span>
                      <span className="font-medium">
                        {stats.percentiles.p25.toFixed(2)}
                        {sensorUnits[key]}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P50: </span>
                      <span className="font-medium">
                        {stats.percentiles.p50.toFixed(2)}
                        {sensorUnits[key]}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P75: </span>
                      <span className="font-medium">
                        {stats.percentiles.p75.toFixed(2)}
                        {sensorUnits[key]}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">P95: </span>
                      <span className="font-medium">
                        {stats.percentiles.p95.toFixed(2)}
                        {sensorUnits[key]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Período:{" "}
                  {new Date(stats.period.start).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(stats.period.end).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>{stats.sampleCount} amostras</span>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  label: string
  value: number
  unit: string
  variant?: "min" | "max" | "default"
}

function StatCard({ label, value, unit, variant = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-3",
        variant === "min" && "bg-[oklch(0.2_0.05_220)]/50",
        variant === "max" && "bg-[oklch(0.25_0.05_25)]/50",
        variant === "default" && "bg-secondary/50"
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {value.toFixed(2)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  )
}
