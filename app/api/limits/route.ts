import { NextResponse } from "next/server"
import type { AlertLimits } from "@/types"

// Limites padrão (em produção, armazenar no MongoDB)
let currentLimits: AlertLimits = {
  humidity: { min: 20, max: 80, warningMin: 25, warningMax: 75 },
  accelerometer: { min: -2, max: 2, warningMin: -1.5, warningMax: 1.5 },
  vibration: { min: 0, max: 10, warningMin: 0, warningMax: 7 },
}

export async function GET() {
  try {
    // Em produção, buscar do MongoDB
    // const client = await clientPromise
    // const db = client.db("clearflow")
    // const limits = await db.collection("settings").findOne({ type: "limits" })

    return NextResponse.json(currentLimits)
  } catch (error) {
    console.error("Erro ao buscar limites:", error)
    return NextResponse.json(
      { error: "Erro ao buscar limites" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const newLimits = await request.json() as AlertLimits

    // Validar limites
    for (const [sensor, limits] of Object.entries(newLimits)) {
      if (limits.min >= limits.max) {
        return NextResponse.json(
          { error: `Limite mínimo deve ser menor que máximo para ${sensor}` },
          { status: 400 }
        )
      }
      if (limits.warningMin < limits.min || limits.warningMax > limits.max) {
        return NextResponse.json(
          { error: `Limites de atenção devem estar dentro dos limites críticos para ${sensor}` },
          { status: 400 }
        )
      }
    }

    // Em produção, salvar no MongoDB
    // const client = await clientPromise
    // const db = client.db("clearflow")
    // await db.collection("settings").updateOne(
    //   { type: "limits" },
    //   { $set: { ...newLimits, updatedAt: new Date() } },
    //   { upsert: true }
    // )

    currentLimits = newLimits

    return NextResponse.json({ success: true, limits: currentLimits })
  } catch (error) {
    console.error("Erro ao atualizar limites:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar limites" },
      { status: 500 }
    )
  }
}
