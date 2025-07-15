"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Button } from "./ui/button"
import { Upload, FileText } from "lucide-react"

interface CsvUploadProps {
  onDrop: (file: File) => void
}

export function CsvUpload({ onDrop }: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const csvFile = files.find((file) => file.type === "text/csv" || file.name.endsWith(".csv"))

      if (csvFile) {
        onDrop(csvFile)
      }
    },
    [onDrop]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onDrop(file)
      }
    },
    [onDrop]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      document.getElementById("file-input")?.click()
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
        relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200
        ${
          isDragOver
            ? "border-blue-400 bg-blue-50/50 shadow-lg shadow-blue-100/50"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
        }
      `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Upload CSV file by dragging and dropping or clicking to select"
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelect}
          className="sr-only"
          aria-describedby="upload-description"
        />

        <div className="space-y-6">
          <div className="flex justify-center">
            {isDragOver ? (
              <div className="p-4 rounded-full bg-blue-100">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            ) : (
              <div className="p-4 rounded-full bg-slate-100">
                <Upload className="h-8 w-8 text-slate-600" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xl font-semibold text-slate-900">
              {isDragOver ? "Drop your CSV file here" : "Drag and drop your CSV file"}
            </p>
            <p id="upload-description" className="text-slate-500">
              or click to browse your files
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => document.getElementById("file-input")?.click()}
            className="bg-white hover:bg-slate-50 border-slate-300 text-slate-700 px-8 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
          >
            Choose File
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">Supported format: CSV files only</p>
    </div>
  )
}
