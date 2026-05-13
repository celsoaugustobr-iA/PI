"use client"

import useSWR from "swr"
import type { SensorReading, SensorStatistics, Alert, AlertLimits } from "@/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSensors() {
  const { data, error, isLoading, mutate } = useSWR<{
    readings: SensorReading[]
    statistics: Record<string, SensorStatistics>
    alerts: Alert[]
    limits: AlertLimits
  }>("/api/sensors", fetcher, {
    refreshInterval: 2000, // Atualiza a cada 2 segundos
    revalidateOnFocus: true,
  })

  return {
    readings: data?.readings ?? [],
    statistics: data?.statistics ?? {},
    alerts: data?.alerts ?? [],
    limits: data?.limits ?? {
      humidity: { min: 20, max: 80, warningMin: 25, warningMax: 75 },
      accelerometer: { min: -2, max: 2, warningMin: -1.5, warningMax: 1.5 },
      vibration: { min: 0, max: 10, warningMin: 0, warningMax: 7 },
    },
    isLoading,
    isError: error,
    refresh: mutate,
  }
}

export function useAlerts() {
  const { data, error, isLoading, mutate } = useSWR<Alert[]>(
    "/api/alerts",
    fetcher,
    {
      refreshInterval: 5000,
    }
  )

  const acknowledgeAlert = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}/acknowledge`, { method: "POST" })
    mutate()
  }

  return {
    alerts: data ?? [],
    isLoading,
    isError: error,
    acknowledgeAlert,
    refresh: mutate,
  }
}

export function useHistory(sensorType?: string, startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams()
  if (sensorType) params.set("type", sensorType)
  if (startDate) params.set("start", startDate.toISOString())
  if (endDate) params.set("end", endDate.toISOString())

  const { data, error, isLoading } = useSWR<SensorReading[]>(
    `/api/history?${params.toString()}`,
    fetcher
  )

  return {
    readings: data ?? [],
    isLoading,
    isError: error,
  }
}

export function useLimits() {
  const { data, error, isLoading, mutate } = useSWR<AlertLimits>(
    "/api/limits",
    fetcher
  )

  const updateLimits = async (newLimits: AlertLimits) => {
    await fetch("/api/limits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLimits),
    })
    mutate()
  }

  return {
    limits: data ?? {
      humidity: { min: 20, max: 80, warningMin: 25, warningMax: 75 },
      accelerometer: { min: -2, max: 2, warningMin: -1.5, warningMax: 1.5 },
      vibration: { min: 0, max: 10, warningMin: 0, warningMax: 7 },
    },
    isLoading,
    isError: error,
    updateLimits,
    refresh: mutate,
  }
}
