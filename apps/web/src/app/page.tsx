"use client" // tells Next.js this is a client-side component

import { useState } from "react"
import { CsvUpload } from "./components/csv-upload"
import { CsvPreview } from "./components/csv-preview"
import { Navbar } from "./components/navbar"
import { Footer } from "./components/footer"
import { parseCsv, Transaction } from "../lib/parseCsv"

export default function HomePage() {
  const [csvData, setCsvData] = useState<Transaction[] | null>(null)
  const [fileName, setFileName] = useState<string>("")

  const handleFileDrop = (file: File) => {
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCsv(text)
      setCsvData(parsed) // render all rows
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
      <Navbar />

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
              <section aria-labelledby="preview-heading" className="animate-in fade-in-50 duration-500">
                <h2 id="preview-heading" className="sr-only">
                  CSV File Preview
                </h2>
                <CsvPreview data={csvData} fileName={fileName} />
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
