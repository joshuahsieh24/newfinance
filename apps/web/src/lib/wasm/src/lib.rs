use wasm_bindgen::prelude::*;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2;
use sha2::Sha256;
use base64::{Engine as _, engine::general_purpose};
use getrandom::getrandom;

#[wasm_bindgen]
pub struct EncryptionModule;

#[wasm_bindgen]
impl EncryptionModule {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self
    }

    /// Encrypt data using AES-256-GCM with PBKDF2 key derivation
    #[wasm_bindgen]
    pub fn encrypt(&self, data: &str, passphrase: &str) -> Result<String, JsValue> {
        // Generate random salt and IV
        let mut salt = [0u8; 16];
        let mut iv = [0u8; 12];
        getrandom(&mut salt).map_err(|e| JsValue::from_str(&format!("Failed to generate salt: {}", e)))?;
        getrandom(&mut iv).map_err(|e| JsValue::from_str(&format!("Failed to generate IV: {}", e)))?;

        // Derive key using PBKDF2
        let mut key = [0u8; 32];
        pbkdf2::<Hmac<Sha256>>(
            passphrase.as_bytes(),
            &salt,
            100_000, // 100k iterations
            &mut key,
        ).map_err(|e| JsValue::from_str(&format!("Failed to derive key: {}", e)))?;

        // Create AES-GCM cipher
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| JsValue::from_str(&format!("Failed to create cipher: {}", e)))?;

        // Encrypt the data
        let nonce = Nonce::from_slice(&iv);
        let ciphertext = cipher
            .encrypt(nonce, data.as_bytes())
            .map_err(|e| JsValue::from_str(&format!("Failed to encrypt: {}", e)))?;

        // Combine IV + salt + encrypted data
        let mut result = Vec::with_capacity(iv.len() + salt.len() + ciphertext.len());
        result.extend_from_slice(&iv);
        result.extend_from_slice(&salt);
        result.extend_from_slice(&ciphertext);

        // Base64 encode the result
        Ok(general_purpose::STANDARD.encode(result))
    }

    /// Decrypt data using AES-256-GCM with PBKDF2 key derivation
    #[wasm_bindgen]
    pub fn decrypt(&self, encrypted_data: &str, passphrase: &str) -> Result<String, JsValue> {
        // Decode base64 data
        let data = general_purpose::STANDARD
            .decode(encrypted_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to decode base64: {}", e)))?;

        if data.len() < 28 {
            return Err(JsValue::from_str("Invalid encrypted data format"));
        }

        // Extract IV, salt, and ciphertext
        let iv = &data[0..12];
        let salt = &data[12..28];
        let ciphertext = &data[28..];

        // Derive key using PBKDF2
        let mut key = [0u8; 32];
        pbkdf2::<Hmac<Sha256>>(
            passphrase.as_bytes(),
            salt,
            100_000, // 100k iterations
            &mut key,
        ).map_err(|e| JsValue::from_str(&format!("Failed to derive key: {}", e)))?;

        // Create AES-GCM cipher
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| JsValue::from_str(&format!("Failed to create cipher: {}", e)))?;

        // Decrypt the data
        let nonce = Nonce::from_slice(iv);
        let plaintext = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| JsValue::from_str(&format!("Failed to decrypt: {}", e)))?;

        // Convert to string
        String::from_utf8(plaintext)
            .map_err(|e| JsValue::from_str(&format!("Failed to convert to string: {}", e)))
    }

    /// Generate a secure random key
    #[wasm_bindgen]
    pub fn generate_key(&self) -> Result<String, JsValue> {
        let mut key = [0u8; 32];
        getrandom(&mut key).map_err(|e| JsValue::from_str(&format!("Failed to generate key: {}", e)))?;
        Ok(general_purpose::STANDARD.encode(key))
    }

    /// Hash data using SHA-256
    #[wasm_bindgen]
    pub fn hash(&self, data: &str) -> Result<String, JsValue> {
        use sha2::{Sha256, Digest};
        
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let result = hasher.finalize();
        
        Ok(format!("{:x}", result))
    }
}

// Helper function to create a new encryption module
#[wasm_bindgen]
pub fn create_encryption_module() -> EncryptionModule {
    EncryptionModule::new()
}

// Import the Hmac type for PBKDF2
use hmac::Hmac;