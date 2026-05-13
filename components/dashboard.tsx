"use client"

import { useState } from "react"
import { useSensors } from "@/hooks/use-sensors"
import { SensorCard } from "@/components/sensor-card"
import { SensorChart } from "@/components/sensor-chart"
import { AlertsPanel } from "@/components/alerts-panel"
import { StatsPanel } from "@/components/stats-panel"
import { Header } from "@/components/header"
import { Spinner } from "@/components/ui/spinner"
import { Droplets, Activity, Vibrate, AlertTriangle } from "lucide-react"

export function Dashboard() {
  const { readings, statistics, alerts, limits, isLoading, isError } = useSensors()
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null)

  // Pegar últimas leituras de cada tipo
  const latestReadings = {
    humidity: readings.find((r) => r.sensorType === "humidity"),
    accelerometer: readings.find((r) => r.sensorType === "accelerometer"),
    vibration: readings.find((r) => r.sensorType === "vibration"),
  }

  // Filtrar leituras para gráficos
  const chartData = {
    humidity: readings
      .filter((r) => r.sensorType === "humidity")
      .slice(0, 30)
      .reverse(),
    accelerometer: readings
      .filter((r) => r.sensorType === "accelerometer")
      .slice(0, 30)
      .reverse(),
    vibration: readings
      .filter((r) => r.sensorType === "vibration")
      .slice(0, 30)
      .reverse(),
  }

  // Contar alertas ativos
  const activeAlerts = alerts.filter((a) => !a.acknowledged)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Carregando dados dos sensores...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <AlertTriangle className="h-12 w-12" />
          <p>Erro ao carregar dados. Verifique a conexão.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeAlerts={activeAlerts.length} />

      <main className="container mx-auto px-4 py-6">
        {/* Cards de Status */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Status dos Sensores
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SensorCard
              title="Umidade do Solo"
              icon={Droplets}
              value={latestReadings.humidity?.value ?? 0}
              unit="%"
              status={getStatus(latestReadings.humidity?.value ?? 0, limits.humidity)}
              trend={statistics.humidity?.trend ?? "stable"}
              onClick={() => setSelectedSensor("humidity")}
              isSelected={selectedSensor === "humidity"}
            />
            <SensorCard
              title="Acelerômetro"
              icon={Activity}
              value={latestReadings.accelerometer?.value ?? 0}
              unit="g"
              status={getStatus(
                Math.abs(latestReadings.accelerometer?.value ?? 0),
                { ...limits.accelerometer, min: 0 }
              )}
              trend={statistics.accelerometer?.trend ?? "stable"}
              onClick={() => setSelectedSensor("accelerometer")}
              isSelected={selectedSensor === "accelerometer"}
            />
            <SensorCard
              title="Vibração"
              icon={Vibrate}
              value={latestReadings.vibration?.value ?? 0}
              unit="mm/s"
              status={getStatus(latestReadings.vibration?.value ?? 0, limits.vibration)}
              trend={statistics.vibration?.trend ?? "stable"}
              onClick={() => setSelectedSensor("vibration")}
              isSelected={selectedSensor === "vibration"}
            />
          </div>
        </section>

        {/* Gráficos */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Monitoramento em Tempo Real
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <SensorChart
              title="Umidade do Solo"
              data={chartData.humidity}
              dataKey="value"
              color="hsl(var(--chart-1))"
              unit="%"
              limits={limits.humidity}
            />
            <SensorChart
              title="Vibração"
              data={chartData.vibration}
              dataKey="value"
              color="hsl(var(--chart-3))"
              unit="mm/s"
              limits={limits.vibration}
            />
          </div>
        </section>

        {/* Estatísticas e Alertas */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StatsPanel statistics={statistics} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} />
          </div>
        </section>
      </main>
    </div>
  )
}

function getStatus(
  value: number,
  limits: { min: number; max: number; warningMin: number; warningMax: number }
): "normal" | "warning" | "critical" {
  if (value < limits.min || value > limits.max) {
    return "critical"
  }
  if (value < limits.warningMin || value > limits.warningMax) {
    return "warning"
  }
  return "normal"
}
