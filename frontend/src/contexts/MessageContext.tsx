import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useWallet } from './WalletContext'
import { 
  sendMessageToContract, 
  getMessagesFromContract, 
  listenForMessages
} from '../services/contractService'
import type { BlockchainMessage } from '../services/contractService'
import { 
  decryptMessage, 
  initializeEncryption 
} from '../utils/encryption'

interface Message {
  id: string
  from: string
  to: string
  content: string
  encryptedContent: string
  timestamp: number
  blockNumber?: number
  transactionHash?: string
  nonce: string
  isDecrypted: boolean
}

interface MessageContextType {
  messages: Message[]
  isSending: boolean
  isLoading: boolean
  error: string
  sendMessage: (data: { to: string; content: string }) => Promise<void>
  loadMessages: () => Promise<void>
  encryptionKeys: { publicKey: string; privateKey: string } | null
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
}

interface MessageProviderProps {
  children: ReactNode
}

export function MessageProvider({ children }: MessageProviderProps) {
  const { user } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [encryptionKeys, setEncryptionKeys] = useState<{ publicKey: string; privateKey: string } | null>(null)

  // Initialize encryption with MetaMask
  useEffect(() => {
    const initializeKeys = async () => {
      if (!user?.address) return

      try {
        // Use MetaMask's encryption public key
        const result = await initializeEncryption(user.address)
        if (result.isSupported && result.publicKey) {
          setEncryptionKeys({
            publicKey: result.publicKey,
            privateKey: user.address // We use the address as identifier for MetaMask decryption
          })
        } else {
          console.warn('Encryption not supported:', result.error)
          setError(result.error || 'Encryption not supported')
        }
      } catch (err: any) {
        console.error('Failed to initialize encryption:', err)
        setError('Failed to initialize encryption')
      }
    }

    initializeKeys()
  }, [user?.address])

  const sendMessage = async (data: { to: string; content: string }) => {
    if (!user?.address || !encryptionKeys) {
      throw new Error('User not connected or keys not initialized')
    }

    setIsSending(true)
    setError('')
    
    try {
      // Send to blockchain
      const txHash = await sendMessageToContract({
        to: data.to,
        content: data.content,
        recipientPublicKey: undefined // Will derive from address
      })
      
      // Create local message object for immediate UI update
      const newMessage: Message = {
        id: `${user.address}-${data.to}-${Date.now()}`,
        from: user.address,
        to: data.to,
        content: data.content,
        encryptedContent: '', // Will be filled when loaded from blockchain
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: txHash,
        nonce: '',
        isDecrypted: true
      }
      
      setMessages(prev => [newMessage, ...prev])
      
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
      throw err
    } finally {
      setIsSending(false)
    }
  }

  const loadMessages = async () => {
    if (!user?.address) return

    setIsLoading(true)
    setError('')
    
    try {
      // Load from blockchain
      const blockchainMessages = await getMessagesFromContract(user.address)
      
      // Convert and decrypt messages
      const decryptedMessages: Message[] = await Promise.all(
        blockchainMessages.map(async (msg): Promise<Message> => {
          let decryptedContent = msg.encryptedContent
          let isDecrypted = false

          try {
            // Use user address for MetaMask decryption
            decryptedContent = await decryptMessage(msg.encryptedContent, user.address)
            isDecrypted = true
          } catch (err) {
            console.warn('Failed to decrypt message:', err)
            // Keep encrypted content as fallback
          }

          return {
            id: msg.id,
            from: msg.from,
            to: msg.to,
            content: decryptedContent,
            encryptedContent: msg.encryptedContent,
            timestamp: msg.timestamp,
            blockNumber: msg.blockNumber,
            transactionHash: msg.transactionHash,
            nonce: msg.nonce,
            isDecrypted
          }
        })
      )
      
      setMessages(decryptedMessages)
      
    } catch (err: any) {
      setError(err.message || 'Failed to load messages')
      console.error('Failed to load messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Listen for new messages
  useEffect(() => {
    if (!user?.address) return

    let cleanup: (() => void) | undefined

    const setupListener = async () => {
      try {
        cleanup = await listenForMessages(user.address, async (newMessage: BlockchainMessage) => {
          // Decrypt the new message
          let decryptedContent = newMessage.encryptedContent
          let isDecrypted = false

          try {
            // Use user address for MetaMask decryption
            decryptedContent = await decryptMessage(newMessage.encryptedContent, user.address)
            isDecrypted = true
          } catch (err) {
            console.warn('Failed to decrypt new message:', err)
          }

          const formattedMessage: Message = {
            id: newMessage.id,
            from: newMessage.from,
            to: newMessage.to,
            content: decryptedContent,
            encryptedContent: newMessage.encryptedContent,
            timestamp: newMessage.timestamp,
            blockNumber: newMessage.blockNumber,
            transactionHash: newMessage.transactionHash,
            nonce: newMessage.nonce,
            isDecrypted
          }

          setMessages(prev => [formattedMessage, ...prev])
        })
      } catch (err) {
        console.error('Failed to setup message listener:', err)
      }
    }

    setupListener()

    return () => {
      if (cleanup) cleanup()
    }
  }, [user?.address, encryptionKeys])

  // Load messages when user connects or keys are ready
  useEffect(() => {
    if (user?.address && encryptionKeys) {
      loadMessages()
    }
  }, [user?.address, encryptionKeys])

  const value: MessageContextType = {
    messages,
    isSending,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    encryptionKeys
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )
}
