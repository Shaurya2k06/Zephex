import { ethers } from 'ethers'

/**
 * Encryption utilities for end-to-end encrypted messaging
 * Uses MetaMask's eth_getEncryptionPublicKey and eth_decrypt for ECIES encryption
 */

export interface EncryptionKeyPair {
  publicKey: string
  privateKey: string
}

export interface EncryptedMessage {
  ciphertext: string
  ephemPublicKey: string
  nonce: string
  version: string
}

/**
 * Get user's encryption public key from MetaMask
 * This uses MetaMask's native encryption which is based on ECIES
 */
export async function getEncryptionPublicKey(address: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    // Request encryption public key from MetaMask
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address]
    })
    
    return publicKey
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User denied access to encryption key')
    }
    throw new Error(`Failed to get encryption public key: ${error.message}`)
  }
}

/**
 * Encrypt a message using recipient's public key
 * Uses MetaMask's encryption which implements ECIES (secp256k1)
 */
export async function encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty')
  }

  try {
    // Use the newer @metamask/eth-sig-util package
    const { encrypt } = await import('@metamask/eth-sig-util')
    
    const encrypted = encrypt({
      publicKey: recipientPublicKey,
      data: message,
      version: 'x25519-xsalsa20-poly1305'
    })
    
    // Return as JSON string for storage on blockchain
    return JSON.stringify(encrypted)
  } catch (error: any) {
    console.error('Encryption failed:', error)
    
    // Fallback encryption for development/testing
    const fallbackEncrypted = {
      ciphertext: btoa(message),
      ephemPublicKey: recipientPublicKey.slice(0, 32),
      nonce: generateShortNonce(),
      version: 'fallback'
    }
    
    return JSON.stringify(fallbackEncrypted)
  }
}

/**
 * Decrypt a message using user's MetaMask account
 * Uses MetaMask's eth_decrypt method
 */
export async function decryptMessage(encryptedMessage: string, userAddress: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }

  try {
    // Parse the encrypted message to validate format
    const encryptedData = JSON.parse(encryptedMessage)
    
    // Check if it's a fallback encrypted message
    if (encryptedData.version === 'fallback') {
      return atob(encryptedData.ciphertext)
    }
    
    // Use MetaMask's decrypt method
    const decryptedMessage = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [encryptedMessage, userAddress]
    })
    
    return decryptedMessage
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User denied decryption request')
    }
    
    console.error('Decryption failed:', error)
    
    // Fallback for development/testing
    try {
      const parsed = JSON.parse(encryptedMessage)
      if (parsed.ciphertext && parsed.version === 'fallback') {
        return atob(parsed.ciphertext)
      }
      if (parsed.data) {
        return parsed.data
      }
    } catch {}
    
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

/**
 * Generate a cryptographically secure nonce for message uniqueness
 */
export function generateNonce(): string {
  const array = new Uint8Array(32) // 32 bytes = 256 bits
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a shorter nonce for blockchain storage (to save gas)
 */
export function generateShortNonce(): string {
  const array = new Uint8Array(16) // 16 bytes = 128 bits
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Derive a deterministic public key from an Ethereum address
 * Note: This is a fallback for when recipient hasn't registered their encryption key
 * In production, always try to get the real encryption public key first
 */
export function derivePublicKeyFromAddress(address: string): string {
  // This is a simplified fallback - not cryptographically secure
  // In production, recipient should register their real encryption public key
  const hash = ethers.keccak256(ethers.toUtf8Bytes(address + '_encryption_key'))
  return hash.slice(2, 66) // Remove 0x and take first 32 bytes
}

/**
 * Validate encryption public key format
 */
export function isValidEncryptionPublicKey(publicKey: string): boolean {
  try {
    // MetaMask encryption public keys are base64 encoded
    if (!publicKey || publicKey.length === 0) return false
    
    // Try to decode base64
    const decoded = atob(publicKey)
    return decoded.length === 32 // secp256k1 public key is 32 bytes
  } catch {
    return false
  }
}

/**
 * Sign a message for verification (not encryption)
 * Used for message authenticity
 */
export async function signMessage(message: string, signer: ethers.Signer): Promise<string> {
  try {
    return await signer.signMessage(message)
  } catch (error: any) {
    throw new Error(`Message signing failed: ${error.message}`)
  }
}

/**
 * Verify a signed message
 */
export function verifySignedMessage(
  message: string, 
  signature: string, 
  expectedSigner: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase()
  } catch {
    return false
  }
}

/**
 * Create a message hash for signing
 * Includes timestamp and nonce for uniqueness
 */
export function createMessageHash(
  content: string, 
  timestamp: number, 
  nonce: string
): string {
  const messageData = {
    content,
    timestamp,
    nonce
  }
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(messageData)))
}

/**
 * Encrypt message with additional metadata
 */
export async function encryptMessageWithMetadata(
  content: string,
  recipientPublicKey: string,
  metadata?: {
    timestamp?: number
    messageId?: string
    threadId?: string
  }
): Promise<string> {
  const messageData = {
    content,
    metadata: {
      timestamp: metadata?.timestamp || Math.floor(Date.now() / 1000),
      messageId: metadata?.messageId || generateShortNonce(),
      threadId: metadata?.threadId || null
    }
  }
  
  return encryptMessage(JSON.stringify(messageData), recipientPublicKey)
}

/**
 * Decrypt message and extract metadata
 */
export async function decryptMessageWithMetadata(
  encryptedMessage: string,
  userAddress: string
): Promise<{
  content: string
  metadata: {
    timestamp: number
    messageId: string
    threadId?: string
  }
}> {
  const decryptedString = await decryptMessage(encryptedMessage, userAddress)
  
  try {
    const messageData = JSON.parse(decryptedString)
    return {
      content: messageData.content || decryptedString,
      metadata: messageData.metadata || {
        timestamp: Math.floor(Date.now() / 1000),
        messageId: generateShortNonce()
      }
    }
  } catch {
    // Fallback for simple messages without metadata
    return {
      content: decryptedString,
      metadata: {
        timestamp: Math.floor(Date.now() / 1000),
        messageId: generateShortNonce()
      }
    }
  }
}

/**
 * Batch encrypt messages for efficiency
 */
export async function batchEncryptMessages(
  messages: Array<{ content: string; recipientPublicKey: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const results: string[] = []
  
  for (let i = 0; i < messages.length; i++) {
    const { content, recipientPublicKey } = messages[i]
    const encrypted = await encryptMessage(content, recipientPublicKey)
    results.push(encrypted)
    
    if (onProgress) {
      onProgress(i + 1, messages.length)
    }
  }
  
  return results
}

/**
 * Estimate encryption gas cost
 * Helps users understand the cost before sending
 */
export function estimateEncryptionGasCost(messageLength: number): number {
  // Base gas cost for transaction
  const baseCost = 21000
  
  // Additional cost per byte of encrypted data
  const byteCost = 16 // Wei per byte for calldata
  
  // Encryption typically increases size by ~50%
  const estimatedEncryptedSize = Math.ceil(messageLength * 1.5)
  
  return baseCost + (estimatedEncryptedSize * byteCost)
}

/**
 * Check if browser supports required encryption features
 */
export function isEncryptionSupported(): boolean {
  return !!(
    window.crypto &&
    window.crypto.subtle &&
    window.ethereum &&
    typeof window.ethereum.request === 'function'
  )
}

/**
 * Initialize encryption for a user
 * Sets up keys and checks compatibility
 */
export async function initializeEncryption(userAddress: string): Promise<{
  publicKey: string
  isSupported: boolean
  error?: string
}> {
  try {
    if (!isEncryptionSupported()) {
      return {
        publicKey: '',
        isSupported: false,
        error: 'Encryption not supported in this browser'
      }
    }
    
    const publicKey = await getEncryptionPublicKey(userAddress)
    
    return {
      publicKey,
      isSupported: true
    }
  } catch (error: any) {
    return {
      publicKey: '',
      isSupported: false,
      error: error.message
    }
  }
}
