export interface Transaction {
  date: string
  description: string
  amount: number
  category?: string
  merchant?: string
  step?: number
  isAnomaly?: boolean
  modelScore?: number | null
  modelFlag?: boolean
  advice?: string | null
  gptInsight?: string | null
}

export function parseCsv(csv: string): Transaction[] {
  const lines = csv.trim().split("\n")
  const [header, ...rows] = lines
  const headers = header.split(",").map(h => h.trim().toLowerCase())

  return rows.map((line) => {
    const values = line.split(",")
    const date = values[headers.indexOf("date")]?.trim()
    const description = values[headers.indexOf("description")]?.trim()
    const amountStr = values[headers.indexOf("amount")]?.trim()
    const amount = parseFloat(amountStr)

    return {
      date,
      description,
      amount,
    }
  })
}

export function markAnomalies(rows: Transaction[]): Transaction[] {
  return rows.map((tx) => ({
    ...tx,
    isAnomaly: tx.amount < 0 && Math.abs(tx.amount) > 1000, // ✅ only negative spending flagged
  }))
}
