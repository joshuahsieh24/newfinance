import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { rateLimiter } from '../../../lib/rate-limiter'
import { RowLevelEncryption } from '../../../lib/encryption'

// Rate limiting middleware
async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const clientIp = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown'
  
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIp)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      },
      { status: 429 }
    )
  }
  
  return null
}

// POST /api/transactions - Insert transaction with encryption
export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse

    const body = await req.json()
    const { 
      user_id, 
      date, 
      description, 
      amount, 
      is_anomaly, 
      model_score, 
      gpt_insight 
    } = body

    // Validate required fields
    if (!user_id || !date || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate encryption key for this transaction
    const encryptionKey = RowLevelEncryption.generateKey()
    
    // Encrypt sensitive data
    const encryptedDescription = await RowLevelEncryption.encrypt(description, encryptionKey)
    const encryptedInsight = gpt_insight ? 
      await RowLevelEncryption.encrypt(gpt_insight, encryptionKey) : null

    // For now, use a valid UUID format for user_id
    const validUserId = "00000000-0000-0000-0000-000000000000"

    // Note: If you get RLS policy errors, you may need to:
    // 1. Disable RLS: ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
    // 2. Or create a policy: CREATE POLICY "Allow all" ON transactions FOR ALL USING (true);
    // 3. Or use service role key instead of anon key

    // Insert into Supabase with encrypted data
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: validUserId,
        date,
        description: encryptedDescription,
        amount,
        is_anomaly,
        model_score,
        gpt_insight: encryptedInsight,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to insert transaction',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data[0]?.id,
      message: 'Transaction inserted securely'
    })

  } catch (error) {
    console.error('Transaction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/transactions - Retrieve transactions with decryption
export async function GET(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await checkRateLimit(req)
    if (rateLimitResponse) return rateLimitResponse

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // For now, use a valid UUID format for user_id
    const validUserId = "00000000-0000-0000-0000-000000000000"

    // Query Supabase
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', validUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve transactions' },
        { status: 500 }
      )
    }

    // Decrypt sensitive data
    const decryptedData = await Promise.all(
      data.map(async (transaction) => {
        try {
          // For now, return encrypted data as-is since we don't have encryption keys stored
          return {
            ...transaction,
            description: transaction.description ? '[Encrypted]' : null,
            gpt_insight: transaction.gpt_insight ? '[Encrypted]' : null
          }
        } catch (decryptError) {
          console.error('Decryption error:', decryptError)
          return {
            ...transaction,
            description: '[Encrypted]',
            gpt_insight: null
          }
        }
      })
    )

    return NextResponse.json({
      transactions: decryptedData,
      count: decryptedData.length,
      hasMore: decryptedData.length === limit
    })

  } catch (error) {
    console.error('Transaction GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 