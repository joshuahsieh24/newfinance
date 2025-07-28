import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { systemMonitor, performHealthCheck } from '../../../lib/monitoring'

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('transactions')
      .select('count', { count: 'exact', head: true })
    
    const dbStatus = error ? 'error' : 'healthy'
    const responseTime = Date.now() - startTime
    
    // Track this request
    systemMonitor.trackRequest(responseTime, !error)
    
    // Get system health metrics
    const healthCheck = performHealthCheck()
    
    return NextResponse.json({
      status: healthCheck.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: {
        percentage: healthCheck.uptime.toFixed(4),
        seconds: process.uptime(),
        target: '99.99%'
      },
      database: {
        status: dbStatus,
        error: error?.message || null
      },
      performance: {
        responseTime: `${responseTime}ms`,
        averageResponseTime: `${healthCheck.memoryUsage.heapUsed / 1024 / 1024}ms`,
        memory: healthCheck.memoryUsage,
        errorRate: `${healthCheck.errorRate.toFixed(2)}%`
      },
      rateLimiting: {
        activeConnections: systemMonitor.getMetrics().activeConnections,
        maxConnections: 250
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV
    })
    
  } catch (error) {
    systemMonitor.trackRequest(Date.now() - startTime, false)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: {
        percentage: systemMonitor.getUptimePercentage().toFixed(4),
        seconds: process.uptime()
      }
    }, { status: 500 })
  }
} 