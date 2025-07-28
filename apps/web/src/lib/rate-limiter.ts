interface TokenBucket {
  tokens: number
  lastRefill: number
  maxTokens: number
  refillRate: number
}

class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map()
  private readonly maxTokens = 250 // 250 requests per minute
  private readonly refillRate = 250 / 60 // tokens per second
  private readonly refillInterval = 60 * 1000 // 1 minute in milliseconds

  private refillTokens(bucket: TokenBucket): void {
    const now = Date.now()
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor(timePassed / 1000 * bucket.refillRate)
    
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }

  async checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    
    if (!this.buckets.has(identifier)) {
      this.buckets.set(identifier, {
        tokens: this.maxTokens,
        lastRefill: now,
        maxTokens: this.maxTokens,
        refillRate: this.refillRate
      })
    }

    const bucket = this.buckets.get(identifier)!
    this.refillTokens(bucket)

    const allowed = bucket.tokens > 0
    if (allowed) {
      bucket.tokens--
    }

    const resetTime = bucket.lastRefill + this.refillInterval

    return {
      allowed,
      remaining: Math.max(0, bucket.tokens),
      resetTime
    }
  }

  // Clean up old buckets to prevent memory leaks
  cleanup(): void {
    const now = Date.now()
    const maxAge = 10 * 60 * 1000 // 10 minutes
    
    for (const [identifier, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(identifier)
      }
    }
  }
}

export const rateLimiter = new RateLimiter()

// Clean up old buckets every 5 minutes
setInterval(() => {
  rateLimiter.cleanup()
}, 5 * 60 * 1000) 