import { ethers } from 'ethers'
import { getContract, getContractReadOnly } from './web3Service'
import { encryptMessage, generateNonce, derivePublicKeyFromAddress } from './encryptionService'
import { MESSAGE_FEE_ETH } from '../utils/constants'
import type { ContractMessage } from '../types/contract'

export interface SendMessageParams {
  to: string
  content: string
  recipientPublicKey?: string
}

export interface BlockchainMessage {
  id: string
  from: string
  to: string
  encryptedContent: string
  content: string
  timestamp: number
  blockNumber: number
  transactionHash: string
  nonce: string
  isDecrypted: boolean
}

// Send a message to the blockchain
export async function sendMessageToContract(params: SendMessageParams): Promise<string> {
  const { to, content, recipientPublicKey } = params
  
  try {
    const contract = await getContract()
    
    // Use provided public key or derive one from address
    const publicKey = recipientPublicKey || derivePublicKeyFromAddress(to)
    
    // Encrypt the message
    const encryptedContent = await encryptMessage(content, publicKey)
    
    // Generate a unique nonce
    const nonce = generateNonce()
    
    // Send transaction
    const transaction = await contract.sendMessage(
      to,
      encryptedContent,
      nonce,
      { 
        value: ethers.parseEther(MESSAGE_FEE_ETH),
        gasLimit: 500000
      }
    )
    
    // Wait for transaction confirmation
    await transaction.wait()
    
    return transaction.hash
  } catch (error: any) {
    console.error('Failed to send message:', error)
    throw new Error(error.message || 'Failed to send message to blockchain')
  }
}

// Get messages for a user from the blockchain
export async function getMessagesFromContract(userAddress: string, offset = 0, limit = 50): Promise<BlockchainMessage[]> {
  try {
    const contract = await getContractReadOnly()
    
    // Get messages from contract
    const messages: ContractMessage[] = await contract.getMessages(userAddress, offset, limit)
    
    // Convert to our format
    const formattedMessages: BlockchainMessage[] = messages.map((msg, index) => ({
      id: `${msg.from}-${msg.to}-${Number(msg.timestamp)}-${index}`,
      from: msg.from,
      to: msg.to,
      encryptedContent: msg.encryptedContent,
      content: msg.encryptedContent, // Will be decrypted later
      timestamp: Number(msg.timestamp),
      blockNumber: 0, // Will be filled from event logs
      transactionHash: '', // Will be filled from event logs
      nonce: msg.nonce,
      isDecrypted: false
    }))
    
    return formattedMessages
  } catch (error: any) {
    console.error('Failed to get messages:', error)
    throw new Error(error.message || 'Failed to get messages from blockchain')
  }
}

// Register user's public key
export async function registerPublicKey(publicKey: string): Promise<string> {
  try {
    const contract = await getContract()
    
    const transaction = await contract.registerPublicKey(publicKey, {
      gasLimit: 100000
    })
    
    await transaction.wait()
    return transaction.hash
  } catch (error: any) {
    console.error('Failed to register public key:', error)
    throw new Error(error.message || 'Failed to register public key')
  }
}

// Get user's public key from blockchain
export async function getPublicKeyFromContract(userAddress: string): Promise<string> {
  try {
    const contract = await getContractReadOnly()
    return await contract.getPublicKey(userAddress)
  } catch (error: any) {
    console.error('Failed to get public key:', error)
    return ''
  }
}

// Check if user is registered
export async function isUserRegistered(userAddress: string): Promise<boolean> {
  try {
    const contract = await getContractReadOnly()
    return await contract.isUserRegistered(userAddress)
  } catch (error: any) {
    console.error('Failed to check user registration:', error)
    return false
  }
}

// Get total message count
export async function getTotalMessageCount(): Promise<number> {
  try {
    const contract = await getContractReadOnly()
    const count = await contract.getTotalMessageCount()
    return Number(count)
  } catch (error: any) {
    console.error('Failed to get total message count:', error)
    return 0
  }
}

// Get conversation between two users
export async function getConversation(user1: string, user2: string, limit = 20): Promise<BlockchainMessage[]> {
  try {
    const contract = await getContractReadOnly()
    
    const messages: ContractMessage[] = await contract.getConversation(user1, user2, limit)
    
    return messages.map((msg, index) => ({
      id: `${msg.from}-${msg.to}-${Number(msg.timestamp)}-${index}`,
      from: msg.from,
      to: msg.to,
      encryptedContent: msg.encryptedContent,
      content: msg.encryptedContent,
      timestamp: Number(msg.timestamp),
      blockNumber: 0,
      transactionHash: '',
      nonce: msg.nonce,
      isDecrypted: false
    }))
  } catch (error: any) {
    console.error('Failed to get conversation:', error)
    throw new Error(error.message || 'Failed to get conversation')
  }
}

// Listen for new messages (events)
export async function listenForMessages(userAddress: string, callback: (message: BlockchainMessage) => void): Promise<() => void> {
  try {
    const contract = await getContractReadOnly()
    
    // Listen for MessageSent events where user is recipient
    const filter = contract.filters.MessageSent(null, userAddress)
    
    const handleMessage = (from: string, to: string, encryptedContent: string, timestamp: bigint, nonce: string, event: any) => {
      const message: BlockchainMessage = {
        id: `${from}-${to}-${Number(timestamp)}-${event.blockNumber}`,
        from,
        to,
        encryptedContent,
        content: encryptedContent,
        timestamp: Number(timestamp),
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        nonce,
        isDecrypted: false
      }
      callback(message)
    }
    
    contract.on(filter, handleMessage)
    
    // Return cleanup function
    return () => {
      contract.off(filter, handleMessage)
    }
  } catch (error: any) {
    console.error('Failed to listen for messages:', error)
    return () => {} // Return empty cleanup function
  }
}
