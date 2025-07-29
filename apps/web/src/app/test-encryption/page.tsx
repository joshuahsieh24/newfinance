'use client'

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { RowLevelEncryption } from '../../lib/encryption-wasm'

export default function TestEncryptionPage() {
  const [inputText, setInputText] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const [encryptedText, setEncryptedText] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const generateKey = async () => {
    setLoading(true)
    setStatus('Generating key...')
    
    try {
      const key = await RowLevelEncryption.generateKey()
      setEncryptionKey(key)
      setStatus('✅ Key generated successfully')
    } catch (error) {
      setStatus(`❌ Key generation failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const encryptData = async () => {
    if (!inputText || !encryptionKey) {
      setStatus('❌ Please enter text and generate a key first')
      return
    }

    setLoading(true)
    setStatus('Encrypting...')
    
    try {
      const encrypted = await RowLevelEncryption.encrypt(inputText, encryptionKey)
      setEncryptedText(encrypted)
      setStatus('✅ Data encrypted successfully')
    } catch (error) {
      setStatus(`❌ Encryption failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const decryptData = async () => {
    if (!encryptedText || !encryptionKey) {
      setStatus('❌ Please encrypt some data first')
      return
    }

    setLoading(true)
    setStatus('Decrypting...')
    
    try {
      const decrypted = await RowLevelEncryption.decrypt(encryptedText, encryptionKey)
      setDecryptedText(decrypted)
      setStatus('✅ Data decrypted successfully')
    } catch (error) {
      setStatus(`❌ Decryption failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const hashData = async () => {
    if (!inputText) {
      setStatus('❌ Please enter text to hash')
      return
    }

    setLoading(true)
    setStatus('Hashing...')
    
    try {
      const hash = await RowLevelEncryption.hash(inputText)
      setStatus(`✅ Hash: ${hash}`)
    } catch (error) {
      setStatus(`❌ Hashing failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🔐 Rust WASM Encryption Test</h1>
        
        <div className="grid gap-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Test Encryption Module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input-text">Input Text</Label>
                <Textarea
                  id="input-text"
                  placeholder="Enter text to encrypt..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={generateKey} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate Key
                </Button>
                <Button 
                  onClick={hashData} 
                  disabled={loading || !inputText}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Hash Data
                </Button>
              </div>

              {encryptionKey && (
                <div className="space-y-2">
                  <Label>Encryption Key</Label>
                  <Input value={encryptionKey} readOnly className="font-mono text-xs" />
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={encryptData} 
                  disabled={loading || !inputText || !encryptionKey}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Encrypt
                </Button>
                <Button 
                  onClick={decryptData} 
                  disabled={loading || !encryptedText || !encryptionKey}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Decrypt
                </Button>
              </div>

              {encryptedText && (
                <div className="space-y-2">
                  <Label>Encrypted Data</Label>
                  <Textarea
                    value={encryptedText}
                    readOnly
                    className="font-mono text-xs min-h-[100px]"
                  />
                </div>
              )}

              {decryptedText && (
                <div className="space-y-2">
                  <Label>Decrypted Data</Label>
                  <Textarea
                    value={decryptedText}
                    readOnly
                    className="font-mono text-xs min-h-[100px]"
                  />
                </div>
              )}

              {status && (
                <div className={`p-3 rounded-lg ${
                  status.startsWith('✅') ? 'bg-green-50 text-green-800' :
                  status.startsWith('❌') ? 'bg-red-50 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {status}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">📚 How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Rust WASM Module</h3>
                <p className="text-sm text-gray-700">
                  The encryption uses a Rust WebAssembly module for high-performance AES-256-GCM encryption 
                  with PBKDF2 key derivation. If the WASM module fails to load, it falls back to the Web Crypto API.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security Features</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• AES-256-GCM encryption with authenticated encryption</li>
                  <li>• PBKDF2 key derivation with 100,000 iterations</li>
                  <li>• Random IV and salt generation for each operation</li>
                  <li>• Base64 encoding for safe storage</li>
                  <li>• Web Crypto API fallback for compatibility</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Performance Benefits</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Native Rust performance for cryptographic operations</li>
                  <li>• Memory safety guaranteed by Rust's type system</li>
                  <li>• Cross-platform compatibility through WebAssembly</li>
                  <li>• Smaller bundle size compared to pure JavaScript</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}