import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");

    if (apiKey !== process.env.ESP32_API_KEY) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const leitura = {
      deviceId: body.deviceId ?? "esp32-higrometro-01",
      sensorType: "soil_moisture",
      ao: Number(body.ao),
      d0: Number(body.d0),
      wet: Boolean(body.wet),
      buzzerOn: Boolean(body.buzzerOn),
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    await db.collection("readings").insertOne(leitura);

    return NextResponse.json({ ok: true, leitura });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erro: "Erro ao salvar leitura" }, { status: 500 });
  }
}

export async function GET() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);

  const readings = await db
    .collection("readings")
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ readings });
}