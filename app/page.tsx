"use client"

import { useMemo } from "react"
import { AlertTriangle, Droplets, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SensorChart } from "@/components/sensor-chart"
import { useSensors } from "@/hooks/use-sensors"

function getRiskData(value: number, limits: { min: number; max: number; warningMin: number; warningMax: number }) {
  if (value <= limits.min || value >= limits.max) {
    return {
      label: "Alto",
      tone: "destructive",
      description: "Risco elevado — observação imediata recomendada.",
    }
  }

  if (value <= limits.warningMin || value >= limits.warningMax) {
    return {
      label: "Médio",
      tone: "warning",
      description: "Nível de atenção — monitorar tendência.",
    }
  }

  return {
    label: "Baixo",
    tone: "success",
    description: "Condição estável dentro dos limites definidos.",
  }
}

export default function HomePage() {
  const { readings, alerts, limits, isLoading, isError } = useSensors()

  const sortedReadings = useMemo(
    () => [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [readings],
  )

  const humidityReadings = useMemo(
    () => sortedReadings.filter((reading) => reading.sensorType === "humidity"),
    [sortedReadings],
  )

  const lastReading = useMemo(() => sortedReadings.slice(-1)[0] ?? null, [sortedReadings])
  const latestHumidity = humidityReadings.slice(-1)[0] ?? null
  const risk = latestHumidity ? getRiskData(latestHumidity.value, limits.humidity) : null
  const activeAlerts = alerts.filter((alert) => !alert.acknowledged).length
  const apiStatus = isError ? "offline" : "online"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6">
        <section className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card/95 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">GeoRisk</p>
            <h1 className="text-3xl font-semibold text-foreground">Visão geral do sistema</h1>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              Monitoramento em tempo real dos sensores e indicadores de risco para apoiar decisões rápidas.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <div className={`rounded-3xl border border-border bg-card p-4 text-sm shadow-sm ${apiStatus === "online" ? "text-success" : "text-destructive"}`}>
              <p className="text-muted-foreground">Status da API</p>
              <p className="mt-2 text-xl font-semibold uppercase">{apiStatus}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 text-sm shadow-sm text-muted-foreground">
              <p>Alertas ativos</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{activeAlerts}</p>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr]">
            <div className="h-96 rounded-3xl bg-muted/60 animate-pulse" />
            <div className="h-[22rem] rounded-3xl bg-muted/60 animate-pulse" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-destructive/30 bg-card p-8 text-center text-destructive shadow-sm">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-semibold">Erro ao carregar dados da API</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifique se o endpoint <code>/api/sensors</code> está disponível.
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-4">
              <Card className="border-border bg-card/95 p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Última leitura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-foreground">
                  <p className="text-2xl font-semibold">
                    {lastReading ? `${lastReading.value} ${lastReading.unit}` : "Sem dados"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lastReading
                      ? `${lastReading.sensorType.toUpperCase()} em ${new Date(lastReading.timestamp).toLocaleString("pt-BR")}`
                      : "Nenhuma leitura recebida"}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card/95 p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Nível de risco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {risk ? (
                    <>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        risk.tone === "destructive"
                          ? "bg-destructive/10 text-destructive"
                          : risk.tone === "warning"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }`}>
                        {risk.label}
                      </span>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados suficientes para indicar risco.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-border bg-card/95 p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Leitura do higrômetro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Droplets className="h-6 w-6 text-success" />
                    <div>
                      <p className="text-2xl font-semibold text-foreground">
                        {latestHumidity ? `${latestHumidity.value}${latestHumidity.unit}` : "--"}
                      </p>
                      <p className="text-sm text-muted-foreground">Último valor disponível</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card/95 p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Reconhecimento de padrão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{alerts.length} alertas totais</p>
                  <p>Dados reais do sensor são usados sem simulação adicional.</p>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
              <Card className="border-border bg-card/95">
                <CardHeader className="flex items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">Gráfico de umidade</CardTitle>
                    <p className="text-sm text-muted-foreground">Últimas leituras do higrômetro</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-success" />
                </CardHeader>
                <CardContent>
                  {humidityReadings.length > 0 ? (
                    <SensorChart
                      title="Umidade do Solo"
                      data={humidityReadings.slice(-40)}
                      dataKey="value"
                      color="hsl(var(--chart-1))"
                      unit="%"
                      limits={limits.humidity}
                    />
                  ) : (
                    <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 text-center text-muted-foreground">
                      <p className="text-base font-medium text-foreground">Aguardando o primeiro dado do higrômetro</p>
                      <p className="mt-2 text-sm">O gráfico será exibido assim que os dados chegarem.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Visão de risco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl bg-muted/30 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Última leitura processada</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {lastReading ? `${lastReading.value}${lastReading.unit}` : "Sem dados"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lastReading ? `${lastReading.sensorType.toUpperCase()} • ${new Date(lastReading.timestamp).toLocaleString("pt-BR")}` : "Nenhuma leitura recebida"}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-border bg-muted/20 p-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Interpretação</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{risk ? risk.label : "Sem dados de risco"}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{risk?.description ?? "Aguardando dados reais para avaliação."}</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              <Card className="border-border bg-card/95 p-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Últimos registros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {humidityReadings.slice(-5).reverse().map((reading) => (
                    <div key={`${reading.sensorId}-${reading.timestamp}`} className="rounded-2xl border border-border p-3">
                      <p className="text-foreground">{reading.value}{reading.unit}</p>
                      <p>{new Date(reading.timestamp).toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                  {humidityReadings.length === 0 && <p>Sem registros para exibir.</p>}
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Indicador técnico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>O painel prioriza dados reais do sensor de umidade para análise preditiva.</p>
                  <p>Não há simulação de sensores físicos não instalados.</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Atenção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Valores de risco são indicativos e baseados nos limites atuais do sensor.</p>
                  <p>Mantenha o sistema conectado para receber predições mais precisas.</p>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
