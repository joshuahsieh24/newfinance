import type { Transaction } from "./parseCsv"

export async function generateInsight(tx: Transaction): Promise<string> {
  const amount = Math.abs(tx.amount)
  const isHighAmount = amount > 1000
  const isNegative = tx.amount < 0
  
  let context = ""
  if (isHighAmount && isNegative) {
    context = `This is a large expense of $${amount.toFixed(2)}`
  } else if (isNegative) {
    context = `This transaction of $${amount.toFixed(2)}`
  } else {
    context = `This transaction of $${amount.toFixed(2)}`
  }

  const prompt = `
${context} at "${tx.description}" has been flagged as potentially unusual.

Please provide:
1. A brief explanation of why this might be concerning
2. One specific, actionable financial tip related to this type of transaction
3. A friendly, encouraging tone

Keep the response under 3 sentences and make it practical for everyday financial management.
`

  try {
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) {
      throw new Error(`GPT API error: ${res.status}`)
    }

    const data = await res.json()
    return data.result || "Consider reviewing this transaction and setting up spending alerts for similar amounts."
  } catch (error) {
    console.error("Insight generation error:", error)
    return "This transaction appears unusual. Consider reviewing your spending patterns and setting up budget alerts."
  }
}
