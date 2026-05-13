import type { SensorReading, Alert, SensorLimits, AlertType } from '@/types'

// Check if a reading triggers an alert
export function checkForAlert(
  reading: SensorReading,
  limits: SensorLimits
): Alert | null {
  const { value } = reading
  const { min, max, criticalMin, criticalMax } = limits.limits

  // Check for critical alerts first
  if (value <= criticalMin) {
    return createAlert(reading, 'critical', criticalMin, `Valor crítico baixo: ${value}${limits.unit} (limite: ${criticalMin}${limits.unit})`)
  }
  if (value >= criticalMax) {
    return createAlert(reading, 'critical', criticalMax, `Valor crítico alto: ${value}${limits.unit} (limite: ${criticalMax}${limits.unit})`)
  }

  // Check for warning alerts
  if (value <= min) {
    return createAlert(reading, 'warning', min, `Valor abaixo do normal: ${value}${limits.unit} (limite: ${min}${limits.unit})`)
  }
  if (value >= max) {
    return createAlert(reading, 'warning', max, `Valor acima do normal: ${value}${limits.unit} (limite: ${max}${limits.unit})`)
  }

  // Check for info alerts (approaching limits - 80% of the way)
  const warningThresholdLow = min + (criticalMin - min) * 0.2
  const warningThresholdHigh = max - (criticalMax - max) * 0.2

  if (value <= warningThresholdLow && value > criticalMin) {
    return createAlert(reading, 'info', min, `Valor próximo do limite inferior: ${value}${limits.unit}`)
  }
  if (value >= warningThresholdHigh && value < criticalMax) {
    return createAlert(reading, 'info', max, `Valor próximo do limite superior: ${value}${limits.unit}`)
  }

  return null
}

// Create an alert object
function createAlert(
  reading: SensorReading,
  alertType: AlertType,
  threshold: number,
  message: string
): Alert {
  return {
    sensorId: reading.sensorId,
    sensorType: reading.sensorType,
    alertType,
    value: reading.value,
    threshold,
    message,
    timestamp: new Date(),
    acknowledged: false
  }
}

// Get alert severity color
export function getAlertColor(alertType: AlertType): string {
  switch (alertType) {
    case 'critical':
      return 'destructive'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'muted'
  }
}

// Get alert severity label
export function getAlertLabel(alertType: AlertType): string {
  switch (alertType) {
    case 'critical':
      return 'Crítico'
    case 'warning':
      return 'Aviso'
    case 'info':
      return 'Informativo'
    default:
      return 'Desconhecido'
  }
}

// Get sensor type label in Portuguese
export function getSensorTypeLabel(sensorType: string): string {
  switch (sensorType) {
    case 'humidity':
      return 'Umidade do Solo'
    case 'accelerometer':
      return 'Acelerômetro'
    case 'vibration':
      return 'Vibração'
    default:
      return sensorType
  }
}

// Sort alerts by priority and timestamp
export function sortAlerts(alerts: Alert[]): Alert[] {
  const priorityOrder: Record<AlertType, number> = {
    critical: 0,
    warning: 1,
    info: 2
  }

  return [...alerts].sort((a, b) => {
    // First sort by acknowledged status (unacknowledged first)
    if (a.acknowledged !== b.acknowledged) {
      return a.acknowledged ? 1 : -1
    }
    // Then by priority
    const priorityDiff = priorityOrder[a.alertType] - priorityOrder[b.alertType]
    if (priorityDiff !== 0) return priorityDiff
    // Finally by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

// Group alerts by sensor type
export function groupAlertsBySensor(alerts: Alert[]): Record<string, Alert[]> {
  return alerts.reduce((acc, alert) => {
    const key = alert.sensorType
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(alert)
    return acc
  }, {} as Record<string, Alert[]>)
}

// Count unacknowledged alerts
export function countUnacknowledgedAlerts(alerts: Alert[]): number {
  return alerts.filter(a => !a.acknowledged).length
}

// Count alerts by type
export function countAlertsByType(alerts: Alert[]): Record<AlertType, number> {
  return alerts.reduce((acc, alert) => {
    acc[alert.alertType] = (acc[alert.alertType] || 0) + 1
    return acc
  }, { critical: 0, warning: 0, info: 0 } as Record<AlertType, number>)
}
