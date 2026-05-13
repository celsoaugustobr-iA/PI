import { NextResponse } from "next/server"
import type { Alert } from "@/types"

// Dados simulados para desenvolvimento
const generateMockAlerts = (): Alert[] => {
  const now = new Date()
  
  return [
    {
      _id: "alert-1",
      sensorId: "sensor-vibration-01",
      sensorType: "vibration",
      severity: "warning",
      message: "Vibração acima do limite de atenção",
      value: 7.5,
      threshold: 7,
      timestamp: new Date(now.getTime() - 300000),
      acknowledged: false,
    },
    {
      _id: "alert-2",
      sensorId: "sensor-humidity-01",
      sensorType: "humidity",
      severity: "info",
      message: "Umidade próxima do limite inferior",
      value: 26,
      threshold: 25,
      timestamp: new Date(now.getTime() - 1800000),
      acknowledged: true,
      acknowledgedAt: new Date(now.getTime() - 1200000),
      acknowledgedBy: "operador@clearflow.com",
    },
    {
      _id: "alert-3",
      sensorId: "sensor-accel-01",
      sensorType: "accelerometer",
      severity: "critical",
      message: "Aceleração fora dos limites seguros",
      value: 2.3,
      threshold: 2,
      timestamp: new Date(now.getTime() - 7200000),
      acknowledged: true,
      acknowledgedAt: new Date(now.getTime() - 6000000),
      acknowledgedBy: "admin@clearflow.com",
    },
  ]
}

export async function GET() {
  try {
    // Em produção, buscar do MongoDB
    const alerts = generateMockAlerts()
    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Erro ao buscar alertas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar alertas" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const alert = await request.json()

    // Em produção, salvar no MongoDB
    // const client = await clientPromise
    // const db = client.db("clearflow")
    // await db.collection("alerts").insertOne({
    //   ...alert,
    //   timestamp: new Date(),
    //   acknowledged: false,
    // })

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    console.error("Erro ao criar alerta:", error)
    return NextResponse.json(
      { error: "Erro ao criar alerta" },
      { status: 500 }
    )
  }
}
