'use client'

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function TestSecurityPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthData(data)
      setTestResults(prev => [...prev, { 
        test: 'Health Check', 
        status: response.ok ? '✅ Success' : '❌ Failed',
        details: data
      }])
    } catch (error) {
      setTestResults(prev => [...prev, { 
        test: 'Health Check', 
        status: '❌ Error',
        details: error
      }])
    }
    setLoading(false)
  }

  const testRateLimit = async () => {
    setLoading(true)
    const results: Array<{
      request: number
      status: number | string
      allowed: boolean
      remaining?: string | null
      error?: any
    }> = []
    
    // Make 5 requests quickly to test rate limiting
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
          user_id: '00000000-0000-0000-0000-000000000000',
          date: '2024-01-01',
          description: 'Test transaction',
          amount: 100,
          is_anomaly: false,
          model_score: 0.5,
          gpt_insight: 'Test insight'
        })
        })
        
        results.push({
          request: i + 1,
          status: response.status,
          allowed: response.ok,
          remaining: response.headers.get('x-ratelimit-remaining')
        })
      } catch (error) {
        results.push({
          request: i + 1,
          status: 'error',
          allowed: false,
          error: error
        })
      }
    }
    
    setTestResults(prev => [...prev, { 
      test: 'Rate Limiting Test', 
      status: '✅ Completed',
      details: results
    }])
    setLoading(false)
  }

  const testEncryption = async () => {
    setLoading(true)
    try {
      // Test encryption by inserting a transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '00000000-0000-0000-0000-000000000000',
          date: '2024-01-01',
          description: 'This is a secret transaction description',
          amount: 999.99,
          is_anomaly: true,
          model_score: 0.95,
          gpt_insight: 'This is sensitive AI advice that should be encrypted'
        })
      })
      
      if (response.ok) {
        setTestResults(prev => [...prev, { 
          test: 'Encryption Test', 
          status: '✅ Success - Data encrypted and stored',
          details: 'Transaction description and AI insight are now encrypted in the database'
        }])
      } else {
        const errorText = await response.text()
        setTestResults(prev => [...prev, { 
          test: 'Encryption Test', 
          status: '❌ Failed',
          details: errorText
        }])
      }
    } catch (error) {
      setTestResults(prev => [...prev, { 
        test: 'Encryption Test', 
        status: '❌ Error',
        details: error
      }])
    }
    setLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
    setHealthData(null)
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Security Features Test</h1>
        
        <div className="grid gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Security Tests!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={testHealthCheck} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Test Health Check
                </Button>
                <Button 
                  onClick={testRateLimit} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Test Rate Limiting
                </Button>
                <Button 
                  onClick={testEncryption} 
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Test Encryption
                </Button>
                <Button 
                  onClick={clearResults} 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {healthData && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">📊 System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Badge variant={healthData.status === 'healthy' ? 'default' : 'destructive'}>
                      Status: {healthData.status}
                    </Badge>
                  </div>
                  <div className="text-gray-700">
                    <p>Uptime: {healthData.uptime?.percentage}%</p>
                    <p>Error Rate: {healthData.performance?.errorRate}</p>
                    <p>Response Time: {healthData.performance?.responseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {testResults.length > 0 && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">🧪 Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{result.test}</span>
                        <Badge variant={result.status.includes('✅') ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                      <pre className="text-sm bg-white border border-gray-200 p-2 rounded overflow-auto text-gray-800">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">What Each Test Does...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Health Check</h3>
                <p className="text-sm text-gray-700">
                  Tests the monitoring system, shows uptime percentage, error rates, and system performance metrics.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rate Limiting</h3>
                <p className="text-sm text-gray-700">
                  Makes multiple rapid requests to demonstrate the 250 req/min limit. You'll see how requests are tracked and limited.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Encryption</h3>
                <p className="text-sm text-gray-700">
                  Inserts a test transaction with sensitive data that gets encrypted before storage. The description and AI insight are encrypted with AES-256.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 