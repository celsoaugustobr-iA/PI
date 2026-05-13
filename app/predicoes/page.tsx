"use client"

import { useMemo } from "react"
import { Activity, AlertTriangle, Droplets, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SensorChart } from "@/components/ui/chart"
import { useSensors } from "@/hooks/use-sensors"

function getRiskData(value: number, limits: { min: number; max: number; warningMin: number; warningMax: number }) {
  if (value <= limits.min || value >= limits.max) {
    return { label: "Alto", tone: "destructive", description: "Risco elevado para deslizamento com base na umidade atual." }
  }
  if (value <= limits.warningMin || value >= limits.warningMax) {
    return { label: "Médio", tone: "warning", description: "Nível de risco moderado. Continue monitorando." }
  }
  return { label: "Baixo", tone: "success", description: "Condição de umidade dentro dos limites seguros." }
}

export default function PredicoesPage() {
  const { readings, limits, isLoading, isError } = useSensors()

  const humidityReadings = useMemo(
    () =>
      readings
        .filter((reading) => reading.sensorType === "humidity")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [readings],
  )

  const latestHumidity = humidityReadings.slice(-1)[0] ?? null
  const risk = latestHumidity ? getRiskData(latestHumidity.value, limits.humidity) : null

  const trendLabel = useMemo(() => {
    if (humidityReadings.length < 2) return "Estável"
    const current = humidityReadings[humidityReadings.length - 1].value
    const previous = humidityReadings[humidityReadings.length - 2].value
    if (current > previous) return "Subindo"
    if (current < previous) return "Caindo"
    return "Estável"
  }, [humidityReadings])

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="container mx-auto space-y-8">
        <header className="rounded-3xl border border-border bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Predições</p>
              <h1 className="mt-2 text-3xl font-semibold">Análise preditiva do GeoRisk</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Visualize a evolução da umidade e entenda o comportamento do risco com base em dados reais.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" /> Dados reais
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-foreground" /> Sem dados simulados
              </span>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card/95 p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-4 w-1/4 animate-pulse rounded-full bg-muted" />
              <div className="h-72 animate-pulse rounded-3xl bg-muted/60" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-destructive/30 bg-card/95 p-8 text-center text-destructive shadow-sm">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-semibold">Falha ao carregar os dados de predição</p>
            <p className="mt-2 text-sm text-muted-foreground">O endpoint <code>/api/sensors</code> retornou erro.</p>
          </div>
        ) : humidityReadings.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/95 p-10 text-center shadow-sm">
            <Droplets className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Sem dados suficientes para predição</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              O GeoRisk aguarda leituras de umidade reais para estimar o nível de risco.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card className="border-border bg-card/95">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Evolução da umidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <SensorChart
                    title="Umidade do Solo"
                    data={humidityReadings.slice(-40)}
                    dataKey="value"
                    color="hsl(var(--chart-1))"
                    unit="%"
                    limits={limits.humidity}
                  />
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resumo de predição</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-3xl bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Risco atual</p>
                    <p className={`mt-2 text-2xl font-semibold ${
                      risk?.tone === "destructive"
                        ? "text-destructive"
                        : risk?.tone === "warning"
                        ? "text-warning"
                        : "text-success"
                    }`}>
                      {risk?.label}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{risk?.description}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Última leitura</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{latestHumidity.value}{latestHumidity.unit}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{new Date(latestHumidity.timestamp).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="rounded-3xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tendência</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">{trendLabel}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Comparação dos dois últimos valores.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Análise rápida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="rounded-3xl bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">A visualização é construída com dados reais do sensor.</p>
                  </div>
                  <div className="rounded-3xl bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Não há dados inventados para aceleração ou vibração.</p>
                  </div>
                  <div className="rounded-3xl bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">A predição acompanha somente o sensor disponível neste momento.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Observação</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    A aba de predições é uma visão técnica: ela mostra como o comportamento de umidade influencia no estado de risco.
                  </p>
                  <p className="mt-3">
                    Quando outros sensores forem adicionados, o painel poderá incluir modelos adicionais de análise.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
