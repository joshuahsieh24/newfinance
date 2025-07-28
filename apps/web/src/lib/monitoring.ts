interface SystemMetrics {
  uptime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: number
  activeConnections: number
  errorRate: number
  responseTime: number
}

class SystemMonitor {
  private startTime: number = Date.now()
  private errorCount: number = 0
  private requestCount: number = 0
  private totalResponseTime: number = 0
  private activeConnections: number = 0

  // Track request metrics
  trackRequest(responseTime: number, success: boolean = true) {
    this.requestCount++
    this.totalResponseTime += responseTime
    
    if (!success) {
      this.errorCount++
    }
  }

  // Track connection
  trackConnection() {
    this.activeConnections++
  }

  // Release connection
  releaseConnection() {
    this.activeConnections = Math.max(0, this.activeConnections - 1)
  }

  // Get current metrics
  getMetrics(): SystemMetrics {
    const uptime = Date.now() - this.startTime
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
    const avgResponseTime = this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0

    return {
      uptime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      activeConnections: this.activeConnections,
      errorRate,
      responseTime: avgResponseTime
    }
  }

  // Check if system is healthy (99.99% uptime target)
  isHealthy(): boolean {
    const metrics = this.getMetrics()
    const uptimePercentage = (metrics.uptime / (24 * 60 * 60 * 1000)) * 100 // Daily uptime
    const errorRateThreshold = 0.01 // 1% error rate threshold
    
    return uptimePercentage >= 99.99 && metrics.errorRate <= errorRateThreshold
  }

  // Get uptime percentage
  getUptimePercentage(): number {
    const metrics = this.getMetrics()
    return (metrics.uptime / (24 * 60 * 60 * 1000)) * 100
  }

  // Reset metrics (useful for testing)
  reset() {
    this.startTime = Date.now()
    this.errorCount = 0
    this.requestCount = 0
    this.totalResponseTime = 0
    this.activeConnections = 0
  }
}

export const systemMonitor = new SystemMonitor()

// Middleware to track requests
export function trackRequest(req: Request, res: Response, next: () => void) {
  const startTime = Date.now()
  
  systemMonitor.trackConnection()
  
  // Track response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const success = res.statusCode < 400
    systemMonitor.trackRequest(responseTime, success)
    systemMonitor.releaseConnection()
  })
  
  next()
}

// Health check function
export function performHealthCheck(): {
  healthy: boolean
  uptime: number
  errorRate: number
  memoryUsage: NodeJS.MemoryUsage
} {
  const metrics = systemMonitor.getMetrics()
  
  return {
    healthy: systemMonitor.isHealthy(),
    uptime: systemMonitor.getUptimePercentage(),
    errorRate: metrics.errorRate,
    memoryUsage: metrics.memoryUsage
  }
} 