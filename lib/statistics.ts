import type { SensorReading, SensorStatistics, SensorType } from '@/types'

// Calculate basic statistics from an array of readings
export function calculateStatistics(readings: SensorReading[]): SensorStatistics['stats'] {
  if (readings.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      count: 0,
      trend: 'stable'
    }
  }

  const values = readings.map(r => r.value)
  const count = values.length
  const sum = values.reduce((a, b) => a + b, 0)
  const avg = sum / count
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Calculate standard deviation
  const squaredDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / count
  const stdDev = Math.sqrt(avgSquaredDiff)

  // Calculate trend based on first and last third of readings
  const trend = calculateTrend(values)

  // Calculate percentiles
  const sortedValues = [...values].sort((a, b) => a - b)
  const p95 = sortedValues[Math.floor(count * 0.95)] ?? max
  const p99 = sortedValues[Math.floor(count * 0.99)] ?? max

  return {
    avg: Number(avg.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    count,
    trend,
    p95: Number(p95.toFixed(2)),
    p99: Number(p99.toFixed(2))
  }
}

// Calculate trend direction
export function calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable'

  const thirdLength = Math.floor(values.length / 3)
  if (thirdLength === 0) return 'stable'

  const firstThird = values.slice(0, thirdLength)
  const lastThird = values.slice(-thirdLength)

  const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length
  const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length

  const changePercent = ((lastAvg - firstAvg) / firstAvg) * 100

  if (changePercent > 5) return 'increasing'
  if (changePercent < -5) return 'decreasing'
  return 'stable'
}

// Calculate change percentage between two values
export function calculateChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return Number((((current - previous) / previous) * 100).toFixed(2))
}

// Determine sensor status based on value and limits
export function determineSensorStatus(
  value: number,
  limits: { min: number; max: number; criticalMin: number; criticalMax: number }
): 'normal' | 'warning' | 'critical' {
  if (value <= limits.criticalMin || value >= limits.criticalMax) {
    return 'critical'
  }
  if (value <= limits.min || value >= limits.max) {
    return 'warning'
  }
  return 'normal'
}

// Generate mock data for testing
export function generateMockReading(sensorType: SensorType, sensorId: string): SensorReading {
  const configs: Record<SensorType, { baseValue: number; variance: number; unit: string }> = {
    humidity: { baseValue: 55, variance: 30, unit: '%' },
    accelerometer: { baseValue: 0, variance: 2, unit: 'g' },
    vibration: { baseValue: 50, variance: 40, unit: 'Hz' }
  }

  const config = configs[sensorType]
  const value = config.baseValue + (Math.random() - 0.5) * config.variance * 2

  return {
    sensorId,
    sensorType,
    value: Number(value.toFixed(2)),
    unit: config.unit,
    timestamp: new Date(),
    metadata: {
      location: 'Setor A',
      deviceId: 'ESP32_001'
    }
  }
}

// Generate historical mock data
export function generateMockHistoricalData(
  sensorType: SensorType,
  sensorId: string,
  hours: number = 24
): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date()

  for (let i = hours * 60; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000)
    const reading = generateMockReading(sensorType, sensorId)
    reading.timestamp = timestamp
    readings.push(reading)
  }

  return readings
}

// Format timestamp for display
export function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format date for display
export function formatDate(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Format full datetime
export function formatDateTime(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
