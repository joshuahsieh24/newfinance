import type { Transaction } from "../../lib/parseCsv"

interface CsvPreviewProps {
  data: Transaction[]
  fileName: string
}

export function CsvPreview({ data, fileName }: CsvPreviewProps) {
  if (!Array.isArray(data) || data.length === 0) return null

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Preview</h3>
        <p className="text-slate-600">
          <strong>{fileName}</strong> · <strong>{data.length}</strong> rows total
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="overflow-y-auto max-h-[500px]">
          <table className="w-full" role="table" aria-label={`Preview of ${fileName}`}>
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{tx.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {tx.amount < 0 ? "-" : ""}${Math.abs(tx.amount).toFixed(2)}
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
