"use client"

import type { Transaction } from "../../lib/parseCsv"
import { useState } from "react"

interface CsvPreviewProps {
  data: Transaction[]
  fileName: string
}

export function CsvPreview({ data, fileName }: CsvPreviewProps) {
  const [expandedAdvice, setExpandedAdvice] = useState<number | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  if (!Array.isArray(data) || data.length === 0) return null

  const toggleAdvice = (index: number) => {
    setExpandedAdvice(expandedAdvice === index ? null : index)
  }

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Preview</h3>
        <p className="text-slate-600">
          <strong>{fileName}</strong> · <strong>{data.length}</strong> rows total
        </p>
        <button
          onClick={toggleFullScreen}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isFullScreen ? "Exit Full Screen" : "Full Screen View"}
        </button>
      </div>

      <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${
        isFullScreen ? 'fixed inset-4 z-50 overflow-hidden' : ''
      }`}>
        <div className={`overflow-y-auto ${isFullScreen ? 'h-full' : 'max-h-[500px]'}`}>
          <table className="w-full" role="table" aria-label={`Preview of ${fileName}`}>
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Risk Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Advice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((tx, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    tx.modelFlag 
                      ? "bg-yellow-50 border-l-4 border-yellow-400" 
                      : tx.isAnomaly 
                        ? "bg-red-50 border-l-4 border-red-400" 
                        : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-slate-700">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {tx.amount < 0 ? "-" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.modelScore !== null && tx.modelScore !== undefined ? (
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${
                          tx.modelFlag ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Math.round(tx.modelScore * 100)}%
                        </span>
                        {tx.modelFlag && (
                          <span className="text-yellow-600 text-xs">⚠️ High Risk</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {tx.gptInsight ? (
                      <div className={`${isFullScreen ? 'max-w-md' : 'max-w-xs'}`}>
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className={`text-xs leading-relaxed text-slate-600 italic ${
                            isFullScreen ? '' : 'line-clamp-3'
                          }`}>
                            {tx.gptInsight}
                          </div>
                          {!isFullScreen && (
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                              Click "Full Screen View" to read complete advice
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
