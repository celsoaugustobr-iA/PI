"use client"

import { useMemo } from "react"
import { AlertTriangle, Activity, Droplets, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SensorChart } from "@/components/ui/chart"
import { useSensors } from "@/hooks/use-sensors"

function getSensorStatus(timestamp?: string) {
  if (!timestamp) return { label: "Sem dados", tone: "warning" }
  const ageSeconds = (Date.now() - new Date(timestamp).getTime()) / 1000
  if (ageSeconds < 180) return { label: "Online", tone: "success" }
  if (ageSeconds < 600) return { label: "Conexão lenta", tone: "warning" }
  return { label: "Sem atualização recente", tone: "destructive" }
}

export default function MonitoramentoPage() {
  const { readings, isLoading, isError } = useSensors()

  const humidityReadings = useMemo(
    () =>
      readings
        .filter((reading) => reading.sensorType === "humidity")
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [readings],
  )

  const latestHumidity = humidityReadings.slice(-1)[0] ?? null
  const sensorStatus = getSensorStatus(latestHumidity?.timestamp)

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="container mx-auto space-y-8">
        <header className="rounded-3xl border border-border bg-card/95 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Monitoramento</p>
              <h1 className="mt-2 text-3xl font-semibold">Sensores GeoRisk</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Cada sensor possui uma área dedicada. O higrômetro já está disponível com dados reais.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-3xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4 text-success" /> Higrômetro ativo
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="rounded-3xl border border-border bg-card/95 p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
              <div className="h-72 animate-pulse rounded-3xl bg-muted/60" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-destructive/30 bg-card/95 p-8 text-center text-destructive shadow-sm">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-semibold">Erro ao ler sensor</p>
            <p className="mt-2 text-sm text-muted-foreground">Falha ao acessar <code>/api/sensors</code>.</p>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border bg-card/95">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Higrômetro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <div className="rounded-3xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`mt-2 text-lg font-semibold ${
                      sensorStatus.tone === "success"
                        ? "text-success"
                        : sensorStatus.tone === "warning"
                        ? "text-warning"
                        : "text-destructive"
                    }`}>
                      {sensorStatus.label}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Valor atual</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {latestHumidity ? `${latestHumidity.value}${latestHumidity.unit}` : "--"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Última leitura</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {latestHumidity ? new Date(latestHumidity.timestamp).toLocaleTimeString("pt-BR") : "--"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Entradas</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{humidityReadings.length}</p>
                  </div>
                </div>

                {humidityReadings.length > 0 ? (
                  <SensorChart
                    title="Histórico de Umidade"
                    data={humidityReadings.slice(-40)}
                    dataKey="value"
                    color="hsl(var(--chart-1))"
                    unit="%"
                  />
                ) : (
                  <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/30 text-center text-muted-foreground">
                    <p className="text-base font-medium text-foreground">Sem dados do higrômetro</p>
                    <p className="mt-2 text-sm">Aguardando a primeira leitura do sensor.</p>
                  </div>
                )}

                {humidityReadings.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Últimos registros</p>
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {humidityReadings.slice(-6).reverse().map((reading) => (
                        <div key={`${reading.sensorId}-${reading.timestamp}`} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm">
                          <span>{new Date(reading.timestamp).toLocaleString("pt-BR")}</span>
                          <span className="font-semibold text-foreground">{reading.value}{reading.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sensor de Vibração</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3 rounded-3xl border border-border bg-muted/20 p-5">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Espaço reservado para integração futura</p>
                      <p className="mt-1">Sem dados disponíveis no momento.</p>
                    </div>
                  </div>
                  <p>Quando o sensor estiver disponível, o gráfico e a tabela serão preenchidos automaticamente.</p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/95 p-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Acelerômetro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3 rounded-3xl border border-border bg-muted/20 p-5">
                    <Zap className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Espaço reservado para integração futura</p>
                      <p className="mt-1">Sem dados disponíveis no momento.</p>
                    </div>
                  </div>
                  <p>O painel mantém a estrutura preparada para adicionar o acelerômetro assim que houver hardware disponível.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
