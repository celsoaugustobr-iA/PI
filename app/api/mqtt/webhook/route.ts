import { NextResponse } from "next/server"

// Endpoint para receber dados do broker MQTT via webhook
// Configure seu broker MQTT para fazer POST neste endpoint quando receber mensagens

interface MQTTPayload {
  topic: string
  payload: {
    sensorId: string
    value: number
    unit: string
    metadata?: Record<string, string>
  }
  timestamp?: string
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as MQTTPayload

    // Validar payload
    if (!data.topic || !data.payload || typeof data.payload.value !== "number") {
      return NextResponse.json(
        { error: "Payload inválido. Esperado: { topic, payload: { sensorId, value, unit } }" },
        { status: 400 }
      )
    }

    // Extrair tipo de sensor do tópico
    // Formato esperado: clearflow/sensors/{type}
    const topicParts = data.topic.split("/")
    const sensorType = topicParts[topicParts.length - 1]

    if (!["humidity", "accelerometer", "vibration"].includes(sensorType)) {
      return NextResponse.json(
        { error: `Tipo de sensor inválido: ${sensorType}` },
        { status: 400 }
      )
    }

    const reading = {
      sensorId: data.payload.sensorId,
      sensorType,
      value: data.payload.value,
      unit: data.payload.unit,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      metadata: data.payload.metadata || {},
    }

    // Em produção, salvar no MongoDB
    // const client = await clientPromise
    // const db = client.db("clearflow")
    // await db.collection("readings").insertOne(reading)

    // Verificar alertas
    // const limits = await db.collection("settings").findOne({ type: "limits" })
    // if (shouldGenerateAlert(reading, limits)) {
    //   await db.collection("alerts").insertOne(createAlert(reading, limits))
    // }

    console.log("[MQTT Webhook] Leitura recebida:", reading)

    return NextResponse.json({
      success: true,
      reading,
      message: "Leitura processada com sucesso",
    })
  } catch (error) {
    console.error("[MQTT Webhook] Erro:", error)
    return NextResponse.json(
      { error: "Erro ao processar leitura" },
      { status: 500 }
    )
  }
}

// Documentação da API
export async function GET() {
  return NextResponse.json({
    name: "ClearFlow MQTT Webhook",
    description: "Endpoint para receber dados de sensores via MQTT bridge",
    version: "1.0.0",
    endpoints: {
      POST: {
        description: "Recebe leituras de sensores",
        contentType: "application/json",
        body: {
          topic: "string - Tópico MQTT (ex: clearflow/sensors/humidity)",
          payload: {
            sensorId: "string - ID único do sensor",
            value: "number - Valor da leitura",
            unit: "string - Unidade de medida",
            metadata: "object (opcional) - Dados adicionais",
          },
          timestamp: "string (opcional) - ISO timestamp da leitura",
        },
        example: {
          topic: "clearflow/sensors/humidity",
          payload: {
            sensorId: "sensor-humidity-01",
            value: 45.5,
            unit: "%",
            metadata: {
              location: "Estufa A",
              depth: "10cm",
            },
          },
        },
      },
    },
    topics: {
      humidity: "clearflow/sensors/humidity",
      accelerometer: "clearflow/sensors/accelerometer",
      vibration: "clearflow/sensors/vibration",
    },
  })
}
