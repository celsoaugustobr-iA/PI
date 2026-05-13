import { NextResponse } from "next/server"
import type { SensorReading } from "@/types"

// Gerar dados históricos simulados
const generateHistoricalData = (
  sensorType: string | null,
  startDate: Date,
  endDate: Date
): SensorReading[] => {
  const readings: SensorReading[] = []
  const diffMs = endDate.getTime() - startDate.getTime()
  const intervalMs = Math.max(60000, diffMs / 500) // Max 500 pontos

  const sensorTypes = sensorType
    ? [sensorType]
    : ["humidity", "accelerometer", "vibration"]

  for (let timestamp = startDate.getTime(); timestamp <= endDate.getTime(); timestamp += intervalMs) {
    const date = new Date(timestamp)
    const hour = date.getHours()
    const dayFactor = Math.sin((hour - 6) * Math.PI / 12) // Pico ao meio-dia

    for (const type of sensorTypes) {
      let value: number
      let unit: string
      let metadata: Record<string, string>

      switch (type) {
        case "humidity":
          // Umidade varia com hora do dia (mais baixa ao meio-dia)
          value = 50 - dayFactor * 15 + (Math.random() - 0.5) * 10
          unit = "%"
          metadata = { location: "Estufa A", depth: "10cm" }
          break
        case "accelerometer":
          // Aceleração mais alta durante horário comercial
          value = hour >= 8 && hour <= 18
            ? Math.sin(timestamp / 5000) * 0.8 + (Math.random() - 0.5) * 0.4
            : (Math.random() - 0.5) * 0.2
          unit = "g"
          metadata = { location: "Motor Principal", axis: "X" }
          break
        case "vibration":
          // Vibração correlacionada com aceleração
          value = hour >= 8 && hour <= 18
            ? 4 + Math.abs(Math.sin(timestamp / 8000)) * 3 + (Math.random() - 0.5) * 2
            : 1 + Math.random() * 2
          unit = "mm/s"
          metadata = { location: "Bomba Hidráulica", frequency: "100Hz" }
          break
        default:
          value = Math.random() * 100
          unit = ""
          metadata = {}
      }

      readings.push({
        _id: `${type}-${timestamp}`,
        sensorId: `sensor-${type}-01`,
        sensorType: type as "humidity" | "accelerometer" | "vibration",
        value,
        unit,
        timestamp: date,
        metadata,
      })
    }
  }

  return readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sensorType = searchParams.get("type")
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")

    // Padrão: últimas 24 horas
    const endDate = endParam ? new Date(endParam) : new Date()
    const startDate = startParam
      ? new Date(startParam)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000)

    // Validar datas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Datas inválidas" },
        { status: 400 }
      )
    }

    // Em produção, buscar do MongoDB
    // const client = await clientPromise
    // const db = client.db("clearflow")
    // const readings = await db.collection("readings").find({
    //   ...(sensorType && { sensorType }),
    //   timestamp: { $gte: startDate, $lte: endDate }
    // }).sort({ timestamp: -1 }).toArray()

    const readings = generateHistoricalData(sensorType, startDate, endDate)

    return NextResponse.json(readings)
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    return NextResponse.json(
      { error: "Erro ao buscar histórico" },
      { status: 500 }
    )
  }
}
