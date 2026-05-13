"use client"

import { useState } from "react"
import { useLimits } from "@/hooks/use-sensors"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Settings, Droplets, Activity, Vibrate, Save, RotateCcw } from "lucide-react"
import type { AlertLimits } from "@/types"

export default function SettingsPage() {
  const { limits, isLoading, updateLimits } = useLimits()
  const [localLimits, setLocalLimits] = useState<AlertLimits | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Usar limites locais se existirem, senão usar os da API
  const currentLimits = localLimits || limits

  const handleChange = (
    sensor: keyof AlertLimits,
    field: keyof AlertLimits["humidity"],
    value: string
  ) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    setLocalLimits((prev) => ({
      ...(prev || limits),
      [sensor]: {
        ...(prev || limits)[sensor],
        [field]: numValue,
      },
    }))
    setMessage(null)
  }

  const handleSave = async () => {
    if (!localLimits) return

    setSaving(true)
    setMessage(null)

    try {
      await updateLimits(localLimits)
      setMessage({ type: "success", text: "Limites atualizados com sucesso!" })
      setLocalLimits(null)
    } catch {
      setMessage({ type: "error", text: "Erro ao salvar limites. Tente novamente." })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setLocalLimits(null)
    setMessage(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeAlerts={0} />
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  const sensorConfig = [
    {
      key: "humidity" as const,
      label: "Umidade do Solo",
      icon: Droplets,
      unit: "%",
      description: "Configure os limites de alerta para o sensor de umidade",
    },
    {
      key: "accelerometer" as const,
      label: "Acelerômetro",
      icon: Activity,
      unit: "g",
      description: "Configure os limites de alerta para o acelerômetro",
    },
    {
      key: "vibration" as const,
      label: "Vibração",
      icon: Vibrate,
      unit: "mm/s",
      description: "Configure os limites de alerta para o sensor de vibração",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header activeAlerts={0} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Settings className="h-6 w-6" />
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os limites de alerta para cada sensor
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-[oklch(0.25_0.05_145)] text-[oklch(0.75_0.15_145)]"
                : "bg-[oklch(0.25_0.08_25)] text-[oklch(0.7_0.2_25)]"
            }`}
          >
            {message.text}
          </div>
        )}

        <Tabs defaultValue="humidity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            {sensorConfig.map((sensor) => (
              <TabsTrigger key={sensor.key} value={sensor.key} className="gap-2">
                <sensor.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{sensor.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {sensorConfig.map((sensor) => (
            <TabsContent key={sensor.key} value={sensor.key}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <sensor.icon className="h-5 w-5" />
                    {sensor.label}
                  </CardTitle>
                  <CardDescription>{sensor.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Limites Críticos */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-destructive">
                      Limites Críticos
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Valores fora destes limites geram alertas críticos
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${sensor.key}-min`}>
                          Mínimo ({sensor.unit})
                        </Label>
                        <Input
                          id={`${sensor.key}-min`}
                          type="number"
                          step="0.1"
                          value={currentLimits[sensor.key].min}
                          onChange={(e) =>
                            handleChange(sensor.key, "min", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${sensor.key}-max`}>
                          Máximo ({sensor.unit})
                        </Label>
                        <Input
                          id={`${sensor.key}-max`}
                          type="number"
                          step="0.1"
                          value={currentLimits[sensor.key].max}
                          onChange={(e) =>
                            handleChange(sensor.key, "max", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Limites de Atenção */}
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-[oklch(0.75_0.18_80)]">
                      Limites de Atenção
                    </h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Valores fora destes limites geram alertas de atenção
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`${sensor.key}-warningMin`}>
                          Mínimo ({sensor.unit})
                        </Label>
                        <Input
                          id={`${sensor.key}-warningMin`}
                          type="number"
                          step="0.1"
                          value={currentLimits[sensor.key].warningMin}
                          onChange={(e) =>
                            handleChange(sensor.key, "warningMin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${sensor.key}-warningMax`}>
                          Máximo ({sensor.unit})
                        </Label>
                        <Input
                          id={`${sensor.key}-warningMax`}
                          type="number"
                          step="0.1"
                          value={currentLimits[sensor.key].warningMax}
                          onChange={(e) =>
                            handleChange(sensor.key, "warningMax", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visualização */}
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">Visualização</h4>
                    <div className="relative h-8 w-full overflow-hidden rounded bg-background">
                      {/* Zona crítica baixa */}
                      <div
                        className="absolute inset-y-0 left-0 bg-[oklch(0.35_0.15_25)]"
                        style={{
                          width: `${((currentLimits[sensor.key].warningMin - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100}%`,
                        }}
                      />
                      {/* Zona de atenção baixa */}
                      <div
                        className="absolute inset-y-0 bg-[oklch(0.4_0.12_80)]"
                        style={{
                          left: `${((currentLimits[sensor.key].warningMin - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100}%`,
                          width: `${((currentLimits[sensor.key].warningMin - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100 * 0.3}%`,
                        }}
                      />
                      {/* Zona normal */}
                      <div
                        className="absolute inset-y-0 bg-[oklch(0.35_0.12_145)]"
                        style={{
                          left: `${((currentLimits[sensor.key].warningMin - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100 + 5}%`,
                          right: `${100 - ((currentLimits[sensor.key].warningMax - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100 + 5}%`,
                        }}
                      />
                      {/* Zona de atenção alta */}
                      <div
                        className="absolute inset-y-0 bg-[oklch(0.4_0.12_80)]"
                        style={{
                          right: `${100 - ((currentLimits[sensor.key].warningMax - currentLimits[sensor.key].min) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100}%`,
                          width: `${((currentLimits[sensor.key].max - currentLimits[sensor.key].warningMax) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100 * 0.3}%`,
                        }}
                      />
                      {/* Zona crítica alta */}
                      <div
                        className="absolute inset-y-0 right-0 bg-[oklch(0.35_0.15_25)]"
                        style={{
                          width: `${((currentLimits[sensor.key].max - currentLimits[sensor.key].warningMax) / (currentLimits[sensor.key].max - currentLimits[sensor.key].min)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>{currentLimits[sensor.key].min}{sensor.unit}</span>
                      <span>{currentLimits[sensor.key].max}{sensor.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Botões de ação */}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!localLimits || saving}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!localLimits || saving}
          >
            {saving ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>

        {/* Info sobre MQTT */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Integração MQTT</CardTitle>
            <CardDescription>
              Configure seus sensores para enviar dados via MQTT
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="mb-2 text-sm font-medium">Tópicos MQTT</h4>
              <div className="space-y-2 font-mono text-xs">
                <p><span className="text-muted-foreground">Umidade:</span> clearflow/sensors/humidity</p>
                <p><span className="text-muted-foreground">Acelerômetro:</span> clearflow/sensors/accelerometer</p>
                <p><span className="text-muted-foreground">Vibração:</span> clearflow/sensors/vibration</p>
              </div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="mb-2 text-sm font-medium">Formato do Payload (JSON)</h4>
              <pre className="overflow-x-auto text-xs text-muted-foreground">
{`{
  "sensorId": "sensor-humidity-01",
  "value": 45.5,
  "unit": "%",
  "metadata": {
    "location": "Estufa A",
    "depth": "10cm"
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
