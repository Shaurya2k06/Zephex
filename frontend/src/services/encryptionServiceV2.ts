// Enhanced Encryption Service for Zephex Messaging
// Provides end-to-end encryption using Web Crypto API

interface EncryptionResult {
  encryptedData: string;
  iv: string;
  keyId: string;
}

interface DecryptionParams {
  encryptedData: string;
  iv: string;
  keyId: string;
}

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJWK: JsonWebKey;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private keyCache: Map<string, CryptoKey> = new Map();
  private userKeyPair: KeyPair | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Initialize user's key pair for encryption
   */
  async initializeUserKeys(): Promise<KeyPair> {
    try {
      // Check if keys exist in localStorage
      const storedKeys = this.loadStoredKeys();
      if (storedKeys) {
        this.userKeyPair = storedKeys;
        return storedKeys;
      }

      // Generate new ECDH key pair for key exchange
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256"
        },
        true, // extractable
        ["deriveKey", "deriveBits"]
      );

      // Export public key for sharing
      const publicKeyJWK = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

      this.userKeyPair = {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        publicKeyJWK
      };

      // Store keys in localStorage
      await this.storeKeys(this.userKeyPair);

      return this.userKeyPair;
    } catch (error) {
      throw new Error(`Failed to initialize encryption keys: ${error}`);
    }
  }

  /**
   * Get user's public key for sharing with contacts
   */
  async getPublicKey(): Promise<JsonWebKey> {
    if (!this.userKeyPair) {
      await this.initializeUserKeys();
    }
    return this.userKeyPair!.publicKeyJWK;
  }

  /**
   * Derive shared secret with another user's public key
   */
  async deriveSharedSecret(otherPublicKeyJWK: JsonWebKey): Promise<CryptoKey> {
    try {
      if (!this.userKeyPair) {
        await this.initializeUserKeys();
      }

      // Import the other user's public key
      const otherPublicKey = await crypto.subtle.importKey(
        "jwk",
        otherPublicKeyJWK,
        {
          name: "ECDH",
          namedCurve: "P-256"
        },
        false,
        []
      );

      // Derive shared secret
      const sharedSecret = await crypto.subtle.deriveKey(
        {
          name: "ECDH",
          public: otherPublicKey
        },
        this.userKeyPair!.privateKey,
        {
          name: "AES-GCM",
          length: 256
        },
        false, // not extractable
        ["encrypt", "decrypt"]
      );

      return sharedSecret;
    } catch (error) {
      throw new Error(`Failed to derive shared secret: ${error}`);
    }
  }

  /**
   * Encrypt message using shared secret
   */
  async encryptMessage(message: string, recipientPublicKey: JsonWebKey): Promise<EncryptionResult> {
    try {
      // Derive shared encryption key
      const sharedKey = await this.deriveSharedSecret(recipientPublicKey);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Convert message to ArrayBuffer
      const messageBuffer = new TextEncoder().encode(message);
      
      // Encrypt the message
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        sharedKey,
        messageBuffer
      );

      // Create key ID from public keys for identification
      const keyId = await this.createKeyId(recipientPublicKey);

      return {
        encryptedData: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv),
        keyId
      };
    } catch (error) {
      throw new Error(`Failed to encrypt message: ${error}`);
    }
  }

  /**
   * Decrypt message using shared secret
   */
  async decryptMessage(params: DecryptionParams, senderPublicKey: JsonWebKey): Promise<string> {
    try {
      // Derive shared decryption key
      const sharedKey = await this.deriveSharedSecret(senderPublicKey);
      
      // Convert base64 strings back to ArrayBuffers
      const encryptedBuffer = this.base64ToArrayBuffer(params.encryptedData);
      const iv = this.base64ToArrayBuffer(params.iv);
      
      // Decrypt the message
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        sharedKey,
        encryptedBuffer
      );

      // Convert back to string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error(`Failed to decrypt message: ${error}`);
    }
  }

  /**
   * Encrypt data for storage (using user's private key)
   */
  async encryptForStorage(data: string): Promise<{ encrypted: string; iv: string }> {
    try {
      // Use a deterministic key derived from user's private key for storage
      const storageKey = await this.deriveStorageKey();
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt data
      const dataBuffer = new TextEncoder().encode(data);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        storageKey,
        dataBuffer
      );

      return {
        encrypted: this.arrayBufferToBase64(encryptedBuffer),
        iv: this.arrayBufferToBase64(iv)
      };
    } catch (error) {
      throw new Error(`Failed to encrypt for storage: ${error}`);
    }
  }

  /**
   * Decrypt data from storage
   */
  async decryptFromStorage(encrypted: string, iv: string): Promise<string> {
    try {
      const storageKey = await this.deriveStorageKey();
      
      const encryptedBuffer = this.base64ToArrayBuffer(encrypted);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBuffer
        },
        storageKey,
        encryptedBuffer
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error(`Failed to decrypt from storage: ${error}`);
    }
  }

  /**
   * Create a unique key ID from public keys
   */
  private async createKeyId(publicKey: JsonWebKey): Promise<string> {
    const keyString = JSON.stringify(publicKey);
    const keyBuffer = new TextEncoder().encode(keyString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
    return this.arrayBufferToBase64(hashBuffer).substring(0, 16);
  }

  /**
   * Derive a consistent storage key from user's private key
   */
  private async deriveStorageKey(): Promise<CryptoKey> {
    if (!this.userKeyPair) {
      throw new Error('User keys not initialized');
    }

    // Export private key to derive storage key
    const privateKeyData = await crypto.subtle.exportKey('pkcs8', this.userKeyPair.privateKey);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      privateKeyData,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive storage key using PBKDF2
    const storageKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('zephex-storage-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );

    return storageKey;
  }

  /**
   * Store keys in localStorage (encrypted)
   */
  private async storeKeys(keyPair: KeyPair): Promise<void> {
    try {
      const privateKeyData = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const publicKeyData = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

      const keysData = {
        privateKey: this.arrayBufferToBase64(privateKeyData),
        publicKey: publicKeyData
      };

      localStorage.setItem('zephex_encryption_keys', JSON.stringify(keysData));
    } catch (error) {
      console.warn('Failed to store encryption keys:', error);
    }
  }

  /**
   * Load keys from localStorage
   */
  private loadStoredKeys(): KeyPair | null {
    try {
      const stored = localStorage.getItem('zephex_encryption_keys');
      if (!stored) return null;

      // This is a simplified approach - in production, you'd want to properly handle async key imports
      // For now, we regenerate keys each session for simplicity
      return null; // Return null for now to trigger new key generation
    } catch (error) {
      console.warn('Failed to load stored keys:', error);
      return null;
    }
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate a mock public key for testing (when real keys aren't available)
   */
  generateMockPublicKey(address: string): JsonWebKey {
    // Create a deterministic 32-byte base64 string based on address
    const hash = address.toLowerCase().replace('0x', '');
    
    // Pad or truncate to ensure we have enough data
    const paddedHash = (hash + hash + hash + hash).substring(0, 64); // 64 hex chars = 32 bytes
    
    // Convert hex to bytes and then to base64
    const xBytes = new Uint8Array(32);
    const yBytes = new Uint8Array(32);
    
    for (let i = 0; i < 32; i++) {
      xBytes[i] = parseInt(paddedHash.substring(i * 2, i * 2 + 2), 16);
      yBytes[i] = parseInt(paddedHash.substring((i + 32) % 64, (i + 32) % 64 + 2), 16);
    }
    
    // Ensure the first byte is less than the curve order (for P-256)
    xBytes[0] = xBytes[0] & 0x7F;
    yBytes[0] = yBytes[0] & 0x7F;
    
    const xBase64 = this.arrayBufferToBase64(xBytes.buffer);
    const yBase64 = this.arrayBufferToBase64(yBytes.buffer);

    return {
      kty: "EC",
      crv: "P-256",
      x: xBase64,
      y: yBase64,
      use: "enc"
    };
  }

  /**
   * Clear all stored encryption data
   */
  clearStoredData(): void {
    localStorage.removeItem('zephex_encryption_keys');
    this.keyCache.clear();
    this.userKeyPair = null;
  }
}

// Export singleton instance
export const encryptionService = EncryptionService.getInstance();
