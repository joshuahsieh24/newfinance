"use client"

import { useState } from "react"
import { CsvUpload } from "./components/csv-upload"
import { CsvPreview } from "./components/csv-preview"
import { Footer } from "./components/footer"
import { parseCsv, Transaction, markAnomalies } from "../lib/parseCsv"
import { generateInsight } from "../lib/insight"
import { supabase } from "../lib/supabase"

export default function HomePage() {
  const [csvData, setCsvData] = useState<Transaction[] | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [showOnlyAnomalies, setShowOnlyAnomalies] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const generateGptInsight = async (tx: Transaction, modelScore: number, features: any): Promise<string> => {
    try {
      const hour = features.step % 24
      const isIncoming = tx.amount > 0
      const transactionType = isIncoming ? "received" : "spent"
      const direction = isIncoming ? "incoming" : "outgoing"
      
      const prompt = `You are a friendly financial assistant helping users understand unusual transactions.

The user ${transactionType} $${Math.abs(tx.amount).toFixed(2)} at "${tx.description}" at ${hour}:00.
This is an ${direction} transaction with a ${Math.round(modelScore * 100)}% risk score.

The merchant has appeared ${features.merchant_freq} time(s) in their history.
The category is "${tx.category || 'unknown'}" and has appeared ${features.category_freq} time(s).

${isIncoming ? 
  'Since this is money RECEIVED, focus on whether the sender is legitimate and if the amount is expected. Incoming payments are generally less risky unless they seem fraudulent or unexpected.' :
  'Since this is money SPENT, focus on whether the recipient is legitimate and if the amount is reasonable for the purpose.'
}

Briefly explain why this might be risky and suggest one action the user can take (e.g. review, ignore, or ask about it).`

      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        throw new Error(`GPT API error: ${res.status}`)
      }

      const data = await res.json()
      return data.result || "Consider reviewing this transaction for potential risks."
    } catch (error) {
      console.error("GPT insight generation error:", error)
      return "Unable to generate advice at this time."
    }
  }

  const handleFileDrop = async (file: File) => {
    setFileName(file.name)
    setIsProcessing(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const parsed = parseCsv(text)
      const flagged = markAnomalies(parsed)

      // First pass: Get ML scores for all transactions
      const mlResults = await Promise.allSettled(
        flagged.map(async (tx) => {
          try {
            const res = await fetch("/api/score", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(tx),
            })
            const { prob, isAnomaly, features } = await res.json()
            return { tx, modelScore: prob, modelFlag: isAnomaly, features }
          } catch (err) {
            console.error("ML model error:", err)
            return { tx, modelScore: null, modelFlag: false, features: null }
          }
        })
      )

      // Second pass: Generate GPT insights for high-risk transactions
      const enriched = await Promise.allSettled(
        mlResults.map(async (result) => {
          if (result.status === 'rejected') {
            return { ...flagged[0], modelScore: null, modelFlag: false, advice: null, gptInsight: null }
          }

          const { tx, modelScore, modelFlag, features } = result.value
          
          // Get AI insight for anomalies (either rule-based or ML-flagged)
          let advice = null
          if (tx.isAnomaly || modelFlag) {
            try {
              advice = await generateInsight(tx)
            } catch {
              advice = "⚠️ Couldn't generate advice"
            }
          }

          // Generate GPT insight for high-risk transactions (higher threshold for incoming payments)
          let gptInsight = null
          const isIncoming = tx.amount > 0
          const riskThreshold = isIncoming ? 0.8 : 0.5 // Higher threshold for incoming payments
          
          if (modelScore !== null && modelScore >= riskThreshold && !tx.gptInsight && features) {
            gptInsight = await generateGptInsight(tx, modelScore, features)
          }

                  // Insert into Supabase using secure API
        try {
          await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: "00000000-0000-0000-0000-000000000000",
              date: tx.date,
              description: tx.description,
              amount: tx.amount,
              is_anomaly: tx.isAnomaly || modelFlag,
              model_score: modelScore,
              gpt_insight: gptInsight,
            }),
          })
        } catch (error) {
          console.error("Failed to insert transaction:", error)
        }

          return { 
            ...tx, 
            modelScore, 
            modelFlag, 
            advice,
            gptInsight,
            // Combined anomaly flag - either rule-based or ML-flagged
            isAnomaly: tx.isAnomaly || modelFlag
          }
        })
      )

      // Extract successful results
      const successfulResults: Transaction[] = []
      for (const result of enriched) {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value)
        }
      }

      setCsvData(successfulResults)
      setIsProcessing(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Upload your bank CSV
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Import your transaction data to get started with intelligent financial insights
            </p>
          </header>

          <div className="space-y-8">
            <CsvUpload onDrop={handleFileDrop} />

            {isProcessing && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-slate-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                  <span>Analyzing transactions with AI...</span>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Need to convert from PDF?{" "}
                <a
                  href="https://bankstatementconverter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                >
                  Use this free tool
                </a>
              </p>
            </div>

            {csvData && (
              <>
                <div className="flex justify-center">
                  <label className="flex items-center space-x-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={showOnlyAnomalies}
                      onChange={() => setShowOnlyAnomalies((prev) => !prev)}
                      className="form-checkbox h-4 w-4 text-red-600"
                    />
                    <span>Show only anomalies</span>
                  </label>
                </div>

                <section aria-labelledby="preview-heading" className="animate-in fade-in-50 duration-500">
                  <h2 id="preview-heading" className="sr-only">
                    CSV File Preview
                  </h2>
                  <CsvPreview
                    data={
                      showOnlyAnomalies
                        ? csvData.filter((tx) => tx.isAnomaly)
                        : csvData
                    }
                    fileName={fileName}
                  />
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

