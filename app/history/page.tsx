"use client"

import { useState } from "react"
import { useHistory } from "@/hooks/use-sensors"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Download, Filter } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { SensorReading } from "@/types"

export default function HistoryPage() {
  const [sensorType, setSensorType] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("24h")

  const getDateRange = () => {
    const now = new Date()
    const ranges: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "6h": 6 * 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    }
    return {
      start: new Date(now.getTime() - (ranges[timeRange] || ranges["24h"])),
      end: now,
    }
  }

  const { start, end } = getDateRange()
  const { readings, isLoading } = useHistory(
    sensorType === "all" ? undefined : sensorType,
    start,
    end
  )

  // Processar dados para o gráfico
  const processChartData = (readings: SensorReading[]) => {
    const grouped: Record<string, Record<string, number>> = {}

    readings.forEach((reading) => {
      const time = new Date(reading.timestamp).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })

      if (!grouped[time]) {
        grouped[time] = {}
      }
      grouped[time][reading.sensorType] = reading.value
    })

    return Object.entries(grouped)
      .map(([time, values]) => ({ time, ...values }))
      .slice(0, 100) // Limitar pontos para performance
  }

  const chartData = processChartData(readings)

  const exportData = () => {
    const csv = [
      ["Timestamp", "Sensor", "Tipo", "Valor", "Unidade"].join(","),
      ...readings.map((r) =>
        [
          new Date(r.timestamp).toISOString(),
          r.sensorId,
          r.sensorType,
          r.value.toFixed(4),
          r.unit,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clearflow-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeAlerts={0} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e exporte dados históricos dos sensores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={sensorType} onValueChange={setSensorType}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sensor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="humidity">Umidade</SelectItem>
                <SelectItem value="accelerometer">Acelerômetro</SelectItem>
                <SelectItem value="vibration">Vibração</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hora</SelectItem>
                <SelectItem value="6h">6 horas</SelectItem>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={exportData} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            {/* Gráfico Principal */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Dados Históricos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
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
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend />
                      {(sensorType === "all" || sensorType === "humidity") && (
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          name="Umidade (%)"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                      {(sensorType === "all" || sensorType === "accelerometer") && (
                        <Line
                          type="monotone"
                          dataKey="accelerometer"
                          name="Acelerômetro (g)"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                      {(sensorType === "all" || sensorType === "vibration") && (
                        <Line
                          type="monotone"
                          dataKey="vibration"
                          name="Vibração (mm/s)"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Leituras</p>
                  <p className="text-2xl font-bold text-foreground">
                    {readings.length.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="text-lg font-medium text-foreground">
                    {start.toLocaleDateString("pt-BR")} - {end.toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Sensores Ativos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(readings.map((r) => r.sensorId)).size}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
