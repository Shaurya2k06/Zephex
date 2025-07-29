import { getContract, getContractReadOnly } from './web3Service'
import { encryptMessage, derivePublicKeyFromAddress } from '../utils/encryption'
import { pinataService } from './ipfs'
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

// Send a message to the blockchain using wallet balance
export async function sendMessageToContract(params: SendMessageParams): Promise<string> {
  const { to, content, recipientPublicKey } = params
  
  try {
    console.log('🚀 Starting message send process...');
    
    const contract = await getContract()
    
    // Use provided public key or derive one from address
    const publicKey = recipientPublicKey || derivePublicKeyFromAddress(to)
    console.log('🔑 Using public key for encryption');
    
    // Encrypt the message
    console.log('🔐 Encrypting message...');
    const encryptedContent = await encryptMessage(content, publicKey)
    
    // Upload encrypted content to IPFS using Pinata
    console.log('📤 Uploading to IPFS via Pinata...');
    const ipfsResult = await pinataService.uploadContent(encryptedContent);
    const cid = ipfsResult.cid;
    console.log('✅ IPFS upload successful. CID:', cid);
    
    // Send to V3 Contract: sendMessage(address receiver, string cid)
    console.log('📝 Sending transaction to blockchain...');
    const transaction = await contract.sendMessage(
      to,
      cid,
      { 
        gasLimit: 500000
      }
    )
    
    console.log('⏳ Waiting for transaction confirmation...');
    await transaction.wait()
    
    console.log('✅ Message sent successfully! TX Hash:', transaction.hash);
    return transaction.hash
  } catch (error: any) {
    console.error('❌ Failed to send message:', error)
    throw new Error(error.message || 'Failed to send message to blockchain')
  }
}

// Get messages for a user from the blockchain
export async function getMessagesFromContract(userAddress: string, offset = 0, limit = 50): Promise<BlockchainMessage[]> {
  try {
    console.log('📨 Retrieving messages for user:', userAddress);
    
    const contract = await getContractReadOnly()
    
    // V3 Contract: Get sent messages
    const sentMessageIds: bigint[] = await contract.getMessages(userAddress, true)
    // V3 Contract: Get received messages  
    const receivedMessageIds: bigint[] = await contract.getMessages(userAddress, false)
    
    console.log(`📊 Found ${sentMessageIds.length} sent and ${receivedMessageIds.length} received messages`);
    
    // Combine and limit results
    const allMessageIds = [...sentMessageIds, ...receivedMessageIds]
    const limitedIds = allMessageIds.slice(offset, offset + limit)
    
    console.log(`📋 Processing ${limitedIds.length} messages...`);
    
    // Get message details for each ID
    const messages: BlockchainMessage[] = []
    for (let i = 0; i < limitedIds.length; i++) {
      const messageId = limitedIds[i];
      try {
        console.log(`📥 Processing message ${i + 1}/${limitedIds.length} (ID: ${messageId})`);
        
        const messageData = await contract.getMessage(messageId)
        
        // Get encrypted content from IPFS
        let encryptedContent = messageData.cid; // Default to CID
        let retrievedContent: string | null = null;
        
        try {
          console.log(`🔍 Retrieving content from IPFS: ${messageData.cid}`);
          retrievedContent = await pinataService.getContent(messageData.cid);
          if (retrievedContent) {
            encryptedContent = retrievedContent;
            console.log('✅ Successfully retrieved content from IPFS');
          }
        } catch (ipfsError) {
          console.warn('⚠️ Failed to retrieve from IPFS, using CID as fallback:', ipfsError);
        }
        
        messages.push({
          id: `${messageData.sender}-${messageData.receiver}-${Number(messageData.timestamp)}-${Number(messageId)}`,
          from: messageData.sender,
          to: messageData.receiver,
          encryptedContent: encryptedContent,
          content: encryptedContent, // Will be decrypted later by the frontend
          timestamp: Number(messageData.timestamp),
          blockNumber: 0, // Will be filled from event logs
          transactionHash: '', // Will be filled from event logs  
          nonce: '', // V3 doesn't use nonce
          isDecrypted: false
        })
      } catch (error) {
        console.warn(`⚠️ Failed to get message ${messageId}:`, error)
      }
    }
    
    console.log(`✅ Successfully processed ${messages.length} messages`);
    return messages
  } catch (error: any) {
    console.error('❌ Failed to get messages:', error)
    throw new Error(error.message || 'Failed to get messages from blockchain')
  }
}

// Register user's public key - NOT AVAILABLE IN V3
export async function registerPublicKey(_publicKey: string): Promise<string> {
  console.warn('registerPublicKey is not available in MessagingContractV3Simple')
  // V3 contract doesn't have this function - return dummy hash
  return '0x0000000000000000000000000000000000000000000000000000000000000000'
}

// Get user's public key from blockchain - NOT AVAILABLE IN V3
export async function getPublicKeyFromContract(_userAddress: string): Promise<string> {
  console.warn('getPublicKey is not available in MessagingContractV3Simple')
  // V3 contract doesn't have this function - return empty string
  return ''
}

// Check if user is registered - NOT AVAILABLE IN V3
export async function isUserRegistered(_userAddress: string): Promise<boolean> {
  console.warn('isUserRegistered is not available in MessagingContractV3Simple')
  // In V3, users don't need to register - return true
  return true
}

// Get total message count - V3 VERSION
export async function getTotalMessageCount(): Promise<number> {
  try {
    const contract = await getContractReadOnly()
    const stats = await contract.getContractStats()
    return Number(stats[0]) // totalMessages is the first return value
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
