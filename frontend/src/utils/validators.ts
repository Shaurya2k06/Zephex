import { ethers } from 'ethers'
import { MAX_MESSAGE_LENGTH, MAX_NONCE_LENGTH } from './constants'

export function isValidAddress(address:string): boolean {
    try {
        return ethers.isAddress(address)
    } catch {
        return false 
    }
}

export function isZeroAddress(address: string): boolean {
  return address === ethers.ZeroAddress
}
export function validateMessage(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' }
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
        return { isValid: false, error: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters` }
    }
    return { isValid: true }
}
export function validateEthAmount(amount: string): { isValid: boolean; error?: string } {
  try {
    const parsed = ethers.parseEther(amount)
    if (parsed < 0) {
      return { isValid: false, error: 'Amount cannot be negative' }
    }
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid ETH amount' }
  }
}
export function hasSufficientBalance(amount: string, balance: string): boolean {
    try {
        const amountWei = ethers.parseEther(amount)
        const balanceWei = ethers.parseEther(amount)
        return balanceWei>=amountWei
    } catch {
        return false
    }
}
export function isValidChainId(chainId: number): boolean {
    return chainId> 0 && Number.isInteger(chainId)
}
export function isCorrectNetwork(chainId:number,expectedChainId:number): boolean {
    return chainId===expectedChainId
}
export function validateGasLimit(gasLimit: string): { isValid: boolean; error?: string } {
  try {
    const limit = parseInt(gasLimit)
    if (limit <= 0) {
      return { isValid: false, error: 'Gas limit must be positive' }
    }
    if (limit > 30000000) { 
      return { isValid: false, error: 'Gas limit too high' }
    }
    return { isValid: true }
  } catch {
    return { isValid: false, error: 'Invalid gas limit' }
  }
}
export function isValidHex (hex:string): boolean {
    return /^0x[0-9a-fA-F]*$/.test(hex)
}
export function isValidTxHash(hash:string): boolean {
    return isValidHex(hash) && hash.length ===66
}
export function validatePublicKey(publicKey: string): {isValid:boolean; error?: string} {
    if(!publicKey || publicKey.trim().length === 0) {
        return {isValid: false, error:'Public Key cant be empty'}
    }
    if(!isValidHex(publicKey)) {
        return {isValid: false , error: 'PublicKey must be a valid hex'}
    }
    return {isValid: true}
}
export function validatePrivateKey(privateKey: string): {isValid:boolean; error?: string} {
    if (!privateKey||privateKey.trim().length===0) {
    return {isValid: false, error: 'PrivateKey cannot be empty'}
    }
    try {
        new ethers.Wallet(privateKey)
        return {isValid: true}
    } catch {
        return {isValid:false, error: 'invalid key format'}
    }
}
export function validatePagination(offset: number , limit: number): {isValid: boolean;error?: string}{
    if (offset<0) {
        return {isValid:false, error: 'Offset cant be negative'}

    }
    if (limit<=0) {
        return {isValid: false, error: 'Limit must be positive'}
    }
    if (limit>100) {
        return {isValid: false, error: 'Limit too high. Max 100'}
    }
    return {isValid: true}
}
export function canSendMessage(lastMessageTime: number, rateLimitSeconds: number): boolean {
    const now= Math.floor(Date.now()/1000)
    return lastMessageTime === 0 || now>lastMessageTime + rateLimitSeconds
}
export function validateFileSize(size: number, maxSizeMB: number= 5): {isValid: boolean; error?: string} {
    const maxSizeBytes = maxSizeMB * 1024*1024
    if (size>maxSizeBytes) {
        return {isValid: false, error : `File too large. Maximum ${maxSizeMB}MB`}
    }
    return {isValid: true}
}
export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}
export function isValidEmail(email: string): boolean {
    const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}