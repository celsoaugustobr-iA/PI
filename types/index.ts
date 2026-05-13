// Sensor Types
export type SensorType = 'humidity' | 'accelerometer' | 'vibration'

export interface SensorReading {
  _id?: string
  sensorId: string
  sensorType: SensorType
  value: number
  unit: string
  timestamp: Date | string
  metadata?: {
    location?: string
    deviceId?: string
  }
}

export interface SensorStatus {
  sensorId: string
  sensorType: SensorType
  name: string
  currentValue: number
  unit: string
  status: 'normal' | 'warning' | 'critical' | 'offline'
  lastUpdate: Date | string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

// Statistics Types
export interface SensorStatistics {
  sensorType: SensorType
  period: string
  stats: {
    avg: number
    min: number
    max: number
    stdDev: number
    count: number
    trend: 'increasing' | 'decreasing' | 'stable'
    p95?: number
    p99?: number
  }
}

export interface DashboardStats {
  totalReadings: number
  activeSensors: number
  alertsToday: number
  avgResponseTime: number
}

// Alert Types
export type AlertType = 'info' | 'warning' | 'critical'

export interface Alert {
  _id?: string
  sensorId: string
  sensorType: SensorType
  alertType: AlertType
  value: number
  threshold: number
  message: string
  timestamp: Date | string
  acknowledged: boolean
  acknowledgedAt?: Date | string
}

// Limit Configuration Types
export interface SensorLimits {
  _id?: string
  sensorType: SensorType
  limits: {
    min: number
    max: number
    criticalMin: number
    criticalMax: number
  }
  unit: string
  updatedAt: Date | string
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface RealTimeChartData {
  sensorId: string
  sensorType: SensorType
  data: ChartDataPoint[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// MQTT Types
export interface MqttMessage {
  sensorId: string
  value: number
  unit: string
  timestamp: string
  deviceId: string
}

// History Filter Types
export interface HistoryFilters {
  sensorType?: SensorType
  sensorId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

// Default Sensor Configurations
export const SENSOR_CONFIG: Record<SensorType, {
  name: string
  unit: string
  icon: string
  color: string
  defaultLimits: SensorLimits['limits']
}> = {
  humidity: {
    name: 'Umidade do Solo',
    unit: '%',
    icon: 'Droplets',
    color: 'chart-1',
    defaultLimits: {
      min: 20,
      max: 80,
      criticalMin: 10,
      criticalMax: 90
    }
  },
  accelerometer: {
    name: 'Acelerômetro',
    unit: 'g',
    icon: 'Activity',
    color: 'chart-2',
    defaultLimits: {
      min: -2,
      max: 2,
      criticalMin: -4,
      criticalMax: 4
    }
  },
  vibration: {
    name: 'Vibração',
    unit: 'Hz',
    icon: 'Vibrate',
    color: 'chart-3',
    defaultLimits: {
      min: 0,
      max: 100,
      criticalMin: 0,
      criticalMax: 150
    }
  }
}
