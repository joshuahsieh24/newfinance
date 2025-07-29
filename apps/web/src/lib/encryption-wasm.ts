// Row-level encryption utilities using Rust WASM with Web Crypto API fallback

interface EncryptionModule {
  encrypt(data: string, passphrase: string): Promise<string>
  decrypt(encryptedData: string, passphrase: string): Promise<string>
  generate_key(): Promise<string>
  hash(data: string): Promise<string>
}

interface WasmModule {
  create_encryption_module(): EncryptionModule
}

export class RowLevelEncryption {
  private static wasmModule: WasmModule | null = null
  private static encryptionModule: EncryptionModule | null = null
  private static wasmLoaded = false
  private static wasmLoading = false

  /**
   * Initialize the WASM module
   */
  private static async initWasm(): Promise<boolean> {
    if (this.wasmLoaded) return true
    if (this.wasmLoading) {
      // Wait for the loading to complete
      while (this.wasmLoading) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      return this.wasmLoaded
    }

    this.wasmLoading = true

    try {
      // Load the WASM module
      const wasmModule = await import('/wasm/financeai_encryption.js')
      this.wasmModule = wasmModule
      this.encryptionModule = wasmModule.create_encryption_module()
      this.wasmLoaded = true
      console.log('✅ Rust WASM encryption module loaded successfully')
      return true
    } catch (error) {
      console.warn('⚠️ Failed to load WASM module, falling back to Web Crypto API:', error)
      this.wasmLoaded = false
      return false
    } finally {
      this.wasmLoading = false
    }
  }

  /**
   * Encrypt sensitive data using WASM or fallback to Web Crypto API
   */
  static async encrypt(data: string, key: string): Promise<string> {
    const wasmAvailable = await this.initWasm()
    
    if (wasmAvailable && this.encryptionModule) {
      try {
        return await this.encryptionModule.encrypt(data, key)
      } catch (error) {
        console.warn('WASM encryption failed, falling back to Web Crypto API:', error)
      }
    }

    // Fallback to Web Crypto API
    return this.encryptWithWebCrypto(data, key)
  }

  /**
   * Decrypt sensitive data using WASM or fallback to Web Crypto API
   */
  static async decrypt(encryptedData: string, key: string): Promise<string> {
    const wasmAvailable = await this.initWasm()
    
    if (wasmAvailable && this.encryptionModule) {
      try {
        return await this.encryptionModule.decrypt(encryptedData, key)
      } catch (error) {
        console.warn('WASM decryption failed, falling back to Web Crypto API:', error)
      }
    }

    // Fallback to Web Crypto API
    return this.decryptWithWebCrypto(encryptedData, key)
  }

  /**
   * Generate a secure encryption key using WASM or fallback to Web Crypto API
   */
  static async generateKey(): Promise<string> {
    const wasmAvailable = await this.initWasm()
    
    if (wasmAvailable && this.encryptionModule) {
      try {
        return await this.encryptionModule.generate_key()
      } catch (error) {
        console.warn('WASM key generation failed, falling back to Web Crypto API:', error)
      }
    }

    // Fallback to Web Crypto API
    return this.generateKeyWithWebCrypto()
  }

  /**
   * Hash sensitive data using WASM or fallback to Web Crypto API
   */
  static async hash(data: string): Promise<string> {
    const wasmAvailable = await this.initWasm()
    
    if (wasmAvailable && this.encryptionModule) {
      try {
        return await this.encryptionModule.hash(data)
      } catch (error) {
        console.warn('WASM hashing failed, falling back to Web Crypto API:', error)
      }
    }

    // Fallback to Web Crypto API
    return this.hashWithWebCrypto(data)
  }

  // Web Crypto API fallback methods
  private static readonly algorithm = {
    name: 'AES-GCM',
    length: 256
  }

  private static readonly ivLength = 12

  private static async encryptWithWebCrypto(data: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      
      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength))
      
      // Import the key
      const keyBuffer = encoder.encode(key)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      
      // Derive the encryption key
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        cryptoKey,
        this.algorithm,
        false,
        ['encrypt']
      )
      
      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm.name,
          iv
        },
        derivedKey,
        dataBuffer
      )
      
      // Combine IV, salt, and encrypted data
      const result = new Uint8Array(iv.length + salt.length + encrypted.byteLength)
      result.set(iv, 0)
      result.set(salt, iv.length)
      result.set(new Uint8Array(encrypted), iv.length + salt.length)
      
      return btoa(String.fromCharCode(...result))
    } catch (error) {
      console.error('Web Crypto encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  private static async decryptWithWebCrypto(encryptedData: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      // Decode the base64 data
      const data = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      // Extract IV, salt, and encrypted data
      const iv = data.slice(0, this.ivLength)
      const salt = data.slice(this.ivLength, this.ivLength + 16)
      const encrypted = data.slice(this.ivLength + 16)
      
      // Import the key
      const keyBuffer = encoder.encode(key)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      
      // Derive the decryption key
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        cryptoKey,
        this.algorithm,
        false,
        ['decrypt']
      )
      
      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm.name,
          iv
        },
        derivedKey,
        encrypted
      )
      
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Web Crypto decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  private static generateKeyWithWebCrypto(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }

  private static async hashWithWebCrypto(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}