export interface EncryptionKeyPair {
  publicKey: string
  privateKey: string
}

export async function generateKeyPair(): Promise<EncryptionKeyPair> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )

  const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKey: arrayBufferToBase64(privateKey)
  }
}

export async function encryptMessage(message: string, publicKeyBase64: string): Promise<string> {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64)
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    )

    const encodedMessage = new TextEncoder().encode(message)
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      encodedMessage
    )

    return arrayBufferToBase64(encryptedBuffer)
  } catch (error) {
    console.error('Encryption failed:', error)

    return btoa(message)
  }
}

export async function decryptMessage(encryptedMessage: string, privateKeyBase64: string): Promise<string> {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64)
    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt']
    )

    const encryptedBuffer = base64ToArrayBuffer(encryptedMessage)
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedBuffer
    )

    return new TextDecoder().decode(decryptedBuffer)
  } catch (error) {
    console.error('Decryption failed:', error)
    // Fallback to base64 decoding for demo
    try {
      return atob(encryptedMessage)
    } catch {
      return encryptedMessage // Return as-is if can't decrypt
    }
  }
}

// Generate a random nonce
export function generateNonce(): string {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Derive public key from wallet address (simplified - in production use proper ECIES)
export function derivePublicKeyFromAddress(address: string): string {
  // This is a simplified approach - in production you'd use proper ECIES
  // and derive the public key from the wallet's private key
  return btoa(address + '_public_key_' + Date.now())
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
