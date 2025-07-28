// Row-level encryption utilities using Web Crypto API
export class RowLevelEncryption {
  private static readonly algorithm = {
    name: 'AES-GCM',
    length: 256
  }

  private static readonly ivLength = 12

  /**
   * Encrypt sensitive data for row-level security
   */
  static async encrypt(data: string, key: string): Promise<string> {
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
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: string, key: string): Promise<string> {
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
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Generate a secure encryption key
   */
  static generateKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  }

  /**
   * Hash sensitive data for secure storage
   */
  static async hash(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
} 