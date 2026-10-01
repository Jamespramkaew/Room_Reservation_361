import { get } from './api'

// Types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
  database?: 'connected' | 'disconnected'
}

// Health Service
export const healthService = {
  // Check API health
  checkHealth: () => get<HealthStatus>('/health'),

  // Check if API is available
  isHealthy: async () => {
    try {
      const response = await get<HealthStatus>('/health')
      return response.success && response.data?.status === 'healthy'
    } catch {
      return false
    }
  },
}
