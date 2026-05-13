"use client"

import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Alert } from "@/types"

interface AlertsPanelProps {
  alerts: Alert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Não reconhecidos primeiro
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged ? 1 : -1
    }
    // Depois por severidade
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    // Por fim, mais recentes primeiro
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const severityConfig = {
    critical: {
      icon: AlertTriangle,
      bg: "bg-[oklch(0.25_0.08_25)]",
      border: "border-[oklch(0.5_0.2_25)]",
      text: "text-[oklch(0.7_0.2_25)]",
    },
    warning: {
      icon: AlertCircle,
      bg: "bg-[oklch(0.25_0.05_80)]",
      border: "border-[oklch(0.6_0.15_80)]",
      text: "text-[oklch(0.8_0.15_80)]",
    },
    info: {
      icon: Info,
      bg: "bg-[oklch(0.2_0.05_220)]",
      border: "border-[oklch(0.5_0.15_220)]",
      text: "text-[oklch(0.7_0.15_220)]",
    },
  }

  const activeAlerts = alerts.filter((a) => !a.acknowledged).length

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Alertas</CardTitle>
          {activeAlerts > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">
              {activeAlerts} ativo{activeAlerts > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {sortedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Check className="mb-2 h-8 w-8 text-[oklch(0.65_0.2_145)]" />
              <p className="text-sm">Nenhum alerta</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAlerts.map((alert) => {
                const config = severityConfig[alert.severity]
                const Icon = config.icon

                return (
                  <div
                    key={alert._id}
                    className={cn(
                      "rounded-lg border p-3 transition-opacity",
                      config.border,
                      config.bg,
                      alert.acknowledged && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.text)} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {alert.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Valor: {alert.value.toFixed(2)} (limite:{" "}
                            {alert.threshold})
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(alert.timestamp).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {alert.acknowledged && alert.acknowledgedBy && (
                          <p className="text-xs text-muted-foreground">
                            Reconhecido por {alert.acknowledgedBy}
                          </p>
                        )}
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          OK
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
