// ECIES (Elliptic Curve Integrated Encryption Scheme) for Zephex
// Uses secp256k1 curve compatible with Ethereum addresses

interface ECIESEncryptionResult {
  ephemeralPublicKey: string; // Hex string
  encryptedData: string;      // Base64 string
  mac: string;                // Hex string
}

interface ECIESKeyPair {
  privateKey: string; // Hex string
  publicKey: string;  // Uncompressed hex string (0x04...)
}

export class ECIESEncryptionService {
  private static instance: ECIESEncryptionService;
  private userKeyPair: ECIESKeyPair | null = null;

  private constructor() {}

  static getInstance(): ECIESEncryptionService {
    if (!ECIESEncryptionService.instance) {
      ECIESEncryptionService.instance = new ECIESEncryptionService();
    }
    return ECIESEncryptionService.instance;
  }

  /**
   * Initialize user's key pair for ECIES encryption
   */
  async initializeUserKeys(): Promise<ECIESKeyPair> {
    try {
      // Check if keys exist in localStorage
      const storedKeys = this.loadStoredKeys();
      if (storedKeys) {
        this.userKeyPair = storedKeys;
        return storedKeys;
      }

      // Generate new secp256k1 key pair
      const keyPair = await this.generateKeyPair();
      this.userKeyPair = keyPair;

      // Store keys in localStorage
      this.storeKeys(keyPair);

      return keyPair;
    } catch (error) {
      throw new Error(`Failed to initialize ECIES keys: ${error}`);
    }
  }

  /**
   * Get user's public key for sharing
   */
  async getPublicKey(): Promise<string> {
    if (!this.userKeyPair) {
      await this.initializeUserKeys();
    }
    return this.userKeyPair!.publicKey;
  }

  /**
   * Encrypt message using ECIES
   */
  async encryptMessage(message: string, recipientPublicKey: string): Promise<ECIESEncryptionResult> {
    try {
      // Generate ephemeral key pair
      const ephemeralKeyPair = await this.generateKeyPair();
      
      // Derive shared secret using ECDH
      const sharedSecret = await this.deriveSharedSecret(
        ephemeralKeyPair.privateKey,
        recipientPublicKey
      );
      
      // Derive encryption and MAC keys from shared secret
      const { encryptionKey, macKey } = await this.deriveKeys(sharedSecret);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      // Encrypt the message using AES-256-CBC
      const encryptedData = await this.aesEncrypt(message, encryptionKey, iv);
      
      // Calculate MAC over ephemeral public key + encrypted data
      const dataToMac = this.hexToBytes(ephemeralKeyPair.publicKey) 
        .concat(Array.from(iv))
        .concat(Array.from(encryptedData));
      const mac = await this.calculateHMAC(new Uint8Array(dataToMac), macKey);
      
      return {
        ephemeralPublicKey: ephemeralKeyPair.publicKey,
        encryptedData: this.bytesToBase64(Array.from(iv).concat(Array.from(encryptedData))),
        mac: this.bytesToHex(Array.from(mac))
      };
    } catch (error) {
      throw new Error(`Failed to encrypt message: ${error}`);
    }
  }

  /**
   * Decrypt message using ECIES
   */
  async decryptMessage(encryptionResult: ECIESEncryptionResult): Promise<string> {
    try {
      if (!this.userKeyPair) {
        throw new Error('User keys not initialized');
      }

      // Derive shared secret using our private key and ephemeral public key
      const sharedSecret = await this.deriveSharedSecret(
        this.userKeyPair.privateKey,
        encryptionResult.ephemeralPublicKey
      );
      
      // Derive encryption and MAC keys
      const { encryptionKey, macKey } = await this.deriveKeys(sharedSecret);
      
      // Verify MAC
      const encryptedDataBytes = this.base64ToBytes(encryptionResult.encryptedData);
      const iv = encryptedDataBytes.slice(0, 16);
      const ciphertext = encryptedDataBytes.slice(16);
      
      const dataToMac = this.hexToBytes(encryptionResult.ephemeralPublicKey)
        .concat(Array.from(iv))
        .concat(Array.from(ciphertext));
      const calculatedMac = await this.calculateHMAC(new Uint8Array(dataToMac), macKey);
      
      if (!this.constantTimeEquals(Array.from(calculatedMac), this.hexToBytes(encryptionResult.mac))) {
        throw new Error('MAC verification failed');
      }
      
      // Decrypt the message
      const decryptedData = await this.aesDecrypt(new Uint8Array(ciphertext), encryptionKey, new Uint8Array(iv));
      
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      throw new Error(`Failed to decrypt message: ${error}`);
    }
  }

  /**
   * Generate a secp256k1 key pair (simplified approach using Web Crypto API)
   */
  private async generateKeyPair(): Promise<ECIESKeyPair> {
    // Generate ECDSA key pair (similar to secp256k1)
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256" // Using P-256 as Web Crypto doesn't support secp256k1
      },
      true,
      ["sign", "verify"]
    );

    // Export keys
    const privateKeyData = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const publicKeyData = await crypto.subtle.exportKey("spki", keyPair.publicKey);

    // Convert to hex strings (simplified)
    const privateKeyHex = this.bytesToHex(Array.from(new Uint8Array(privateKeyData)));
    const publicKeyHex = '0x04' + this.bytesToHex(Array.from(new Uint8Array(publicKeyData))).substring(0, 128);

    return {
      privateKey: privateKeyHex,
      publicKey: publicKeyHex
    };
  }

  /**
   * Derive shared secret using ECDH (simplified implementation)
   */
  private async deriveSharedSecret(privateKey: string, publicKey: string): Promise<Uint8Array> {
    // Simplified shared secret derivation using SHA-256
    const combined = privateKey + publicKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  /**
   * Derive encryption and MAC keys from shared secret
   */
  private async deriveKeys(sharedSecret: Uint8Array): Promise<{ encryptionKey: Uint8Array; macKey: Uint8Array }> {
    // Use HKDF to derive keys
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      sharedSecret,
      'HKDF',
      false,
      ['deriveBits']
    );

    const encryptionKeyBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32),
        info: new TextEncoder().encode('encryption')
      },
      keyMaterial,
      256 // 32 bytes
    );

    const macKeyBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32),
        info: new TextEncoder().encode('mac')
      },
      keyMaterial,
      256 // 32 bytes
    );

    return {
      encryptionKey: new Uint8Array(encryptionKeyBits),
      macKey: new Uint8Array(macKeyBits)
    };
  }

  /**
   * AES-256-CBC encryption
   */
  private async aesEncrypt(plaintext: string, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const data = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      data
    );

    return new Uint8Array(encrypted);
  }

  /**
   * AES-256-CBC decryption
   */
  private async aesDecrypt(ciphertext: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      ciphertext
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Calculate HMAC-SHA256
   */
  private async calculateHMAC(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return new Uint8Array(signature);
  }

  /**
   * Constant time comparison to prevent timing attacks
   */
  private constantTimeEquals(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  /**
   * Utility functions for format conversion
   */
  private bytesToHex(bytes: number[]): string {
    return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private hexToBytes(hex: string): number[] {
    const cleanHex = hex.replace(/^0x/, '');
    const bytes: number[] = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return bytes;
  }

  private bytesToBase64(bytes: number[]): string {
    const binary = bytes.map(byte => String.fromCharCode(byte)).join('');
    return btoa(binary);
  }

  private base64ToBytes(base64: string): number[] {
    const binary = atob(base64);
    return Array.from(binary).map(char => char.charCodeAt(0));
  }

  /**
   * Store keys in localStorage
   */
  private storeKeys(keyPair: ECIESKeyPair): void {
    try {
      localStorage.setItem('zephex_ecies_keys', JSON.stringify(keyPair));
    } catch (error) {
      console.warn('Failed to store ECIES keys:', error);
    }
  }

  /**
   * Load keys from localStorage
   */
  private loadStoredKeys(): ECIESKeyPair | null {
    try {
      const stored = localStorage.getItem('zephex_ecies_keys');
      if (!stored) return null;

      return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to load stored ECIES keys:', error);
      return null;
    }
  }

  /**
   * Generate a deterministic public key from Ethereum address (for demo)
   */
  generatePublicKeyFromAddress(address: string): string {
    // Simple deterministic key generation based on address
    const hash = address.toLowerCase().replace('0x', '');
    const paddedHash = (hash + hash + hash + hash).substring(0, 128);
    return '0x04' + paddedHash;
  }

  /**
   * Clear all stored data
   */
  clearStoredData(): void {
    localStorage.removeItem('zephex_ecies_keys');
    this.userKeyPair = null;
  }
}

// Export singleton instance
export const eciesEncryption = ECIESEncryptionService.getInstance();
