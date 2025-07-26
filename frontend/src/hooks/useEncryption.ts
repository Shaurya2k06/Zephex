import { useState, useEffect, useCallback } from 'react'
import { 
  getEncryptionPublicKey, 
  encryptMessage, 
  decryptMessage, 
  initializeEncryption,
  isEncryptionSupported 
} from '../utils/encryption'

export interface UseEncryptionResult {
  publicKey: string | null
  isSupported: boolean
  isInitialized: boolean
  error: string | null
  encrypt: (message: string, recipientPublicKey: string) => Promise<string>
  decrypt: (encryptedMessage: string) => Promise<string>
  initializeKeys: () => Promise<void>
  clearError: () => void
}

export function useEncryption(userAddress?: string): UseEncryptionResult {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if encryption is supported
  useEffect(() => {
    setIsSupported(isEncryptionSupported())
  }, [])

  // Initialize encryption keys when user address changes
  useEffect(() => {
    if (userAddress && isSupported) {
      initializeKeys()
    } else {
      setPublicKey(null)
      setIsInitialized(false)
    }
  }, [userAddress, isSupported])

  const initializeKeys = useCallback(async () => {
    if (!userAddress) return

    try {
      setError(null)
      const result = await initializeEncryption(userAddress)
      
      if (result.isSupported && result.publicKey) {
        setPublicKey(result.publicKey)
        setIsInitialized(true)
      } else {
        setError(result.error || 'Failed to initialize encryption')
        setIsInitialized(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize encryption')
      setIsInitialized(false)
    }
  }, [userAddress])

  const encrypt = useCallback(async (message: string, recipientPublicKey: string): Promise<string> => {
    try {
      setError(null)
      return await encryptMessage(message, recipientPublicKey)
    } catch (err: any) {
      const errorMsg = err.message || 'Encryption failed'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [])

  const decrypt = useCallback(async (encryptedMessage: string): Promise<string> => {
    if (!userAddress) {
      throw new Error('User address required for decryption')
    }

    try {
      setError(null)
      return await decryptMessage(encryptedMessage, userAddress)
    } catch (err: any) {
      const errorMsg = err.message || 'Decryption failed'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }, [userAddress])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    publicKey,
    isSupported,
    isInitialized,
    error,
    encrypt,
    decrypt,
    initializeKeys,
    clearError
  }
}

export function useRecipientPublicKey(recipientAddress: string) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPublicKey = useCallback(async () => {
    if (!recipientAddress) return

    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you'd fetch from your contract or a registry
      // For now, we'll try to get it from MetaMask if possible
      const key = await getEncryptionPublicKey(recipientAddress)
      setPublicKey(key)
    } catch (err: any) {
      console.warn('Could not get recipient public key:', err)
      setError(err.message)
      // Fallback: recipient will need to provide their key
      setPublicKey(null)
    } finally {
      setIsLoading(false)
    }
  }, [recipientAddress])

  useEffect(() => {
    if (recipientAddress) {
      getPublicKey()
    } else {
      setPublicKey(null)
      setError(null)
    }
  }, [recipientAddress, getPublicKey])

  return {
    publicKey,
    isLoading,
    error,
    refresh: getPublicKey
  }
}

export function useBatchEncryption() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const encryptMessages = useCallback(async (
    messages: Array<{ content: string; recipientPublicKey: string }>
  ): Promise<string[]> => {
    setIsProcessing(true)
    setError(null)
    setProgress(0)

    try {
      const results: string[] = []
      
      for (let i = 0; i < messages.length; i++) {
        const { content, recipientPublicKey } = messages[i]
        const encrypted = await encryptMessage(content, recipientPublicKey)
        results.push(encrypted)
        setProgress(((i + 1) / messages.length) * 100)
      }
      
      return results
    } catch (err: any) {
      const errorMsg = err.message || 'Batch encryption failed'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }, [])

  return {
    encryptMessages,
    isProcessing,
    progress,
    error,
    clearError: () => setError(null)
  }
}
