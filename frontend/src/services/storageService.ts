/**
 * Storage service for managing local data persistence
 * Handles encryption keys, user preferences, and cached data
 */

export interface UserSettings {
  notifications: boolean
  autoConnect: boolean
  defaultGasLimit: string
}

export interface CachedMessage {
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

export interface EncryptionKeys {
  publicKey: string
  privateKey: string
}

export interface StorageKeys {
  // Encryption keys for each address
  ENCRYPTION_KEYS: (address: string) => string
  // User settings
  USER_SETTINGS: string
  // Cached messages
  CACHED_MESSAGES: (address: string) => string
  // Wallet connection state
  WALLET_CONNECTED: string
  WALLET_ADDRESS: string
  // Contract interaction cache
  PUBLIC_KEYS_CACHE: string
  LAST_BLOCK_NUMBER: string
  // App preferences
  SIDEBAR_COLLAPSED: string
}

// Storage key constants
export const STORAGE_KEYS: StorageKeys = {
  ENCRYPTION_KEYS: (address: string) => `zephex_keys_${address}`,
  USER_SETTINGS: 'zephex_settings',
  CACHED_MESSAGES: (address: string) => `zephex_messages_${address}`,
  WALLET_CONNECTED: 'zephex_wallet_connected',
  WALLET_ADDRESS: 'zephex_wallet_address',
  PUBLIC_KEYS_CACHE: 'zephex_public_keys',
  LAST_BLOCK_NUMBER: 'zephex_last_block',
  SIDEBAR_COLLAPSED: 'zephex_sidebar_collapsed',
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  autoConnect: false,
  defaultGasLimit: '500000',
}

/**
 * Safely parse JSON from localStorage
 */
function safeParseJSON<T>(value: string | null, defaultValue: T): T {
  if (!value) return defaultValue
  
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error)
    return defaultValue
  }
}

/**
 * Safely stringify and store data
 */
function safeStringifyStore(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to store data in localStorage:', error)
    return false
  }
}

// === Encryption Keys Management ===

export function storeEncryptionKeys(address: string, keys: EncryptionKeys): boolean {
  return safeStringifyStore(STORAGE_KEYS.ENCRYPTION_KEYS(address), keys)
}

export function getEncryptionKeys(address: string): EncryptionKeys | null {
  const stored = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEYS(address))
  return safeParseJSON(stored, null)
}

export function clearEncryptionKeys(address: string): void {
  localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_KEYS(address))
}

// === User Settings Management ===

export function storeUserSettings(settings: Partial<UserSettings>): boolean {
  const current = getUserSettings()
  const updated = { ...current, ...settings }
  return safeStringifyStore(STORAGE_KEYS.USER_SETTINGS, updated)
}

export function getUserSettings(): UserSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
  return safeParseJSON(stored, DEFAULT_SETTINGS)
}

export function clearUserSettings(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS)
}

// === Message Caching ===

export function storeCachedMessages(address: string, messages: CachedMessage[]): boolean {
  return safeStringifyStore(STORAGE_KEYS.CACHED_MESSAGES(address), messages)
}

export function getCachedMessages(address: string): CachedMessage[] {
  const stored = localStorage.getItem(STORAGE_KEYS.CACHED_MESSAGES(address))
  return safeParseJSON(stored, [])
}

export function addCachedMessage(address: string, message: CachedMessage): boolean {
  const messages = getCachedMessages(address)
  
  // Check if message already exists
  const exists = messages.some(m => m.id === message.id)
  if (exists) return true
  
  // Add new message at the beginning (newest first)
  messages.unshift(message)
  
  // Limit cache size (keep last 1000 messages)
  if (messages.length > 1000) {
    messages.splice(1000)
  }
  
  return storeCachedMessages(address, messages)
}

export function clearCachedMessages(address: string): void {
  localStorage.removeItem(STORAGE_KEYS.CACHED_MESSAGES(address))
}

// === Wallet State Management ===

export function storeWalletConnected(connected: boolean): void {
  localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, connected.toString())
}

export function getWalletConnected(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED)
  return stored === 'true'
}

export function storeWalletAddress(address: string): void {
  localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address)
}

export function getWalletAddress(): string | null {
  return localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS)
}

export function clearWalletState(): void {
  localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
  localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS)
}

// === Public Keys Cache ===

export function storePublicKeysCache(cache: Record<string, string>): boolean {
  return safeStringifyStore(STORAGE_KEYS.PUBLIC_KEYS_CACHE, cache)
}

export function getPublicKeysCache(): Record<string, string> {
  const stored = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEYS_CACHE)
  return safeParseJSON(stored, {})
}

export function addPublicKeyToCache(address: string, publicKey: string): boolean {
  const cache = getPublicKeysCache()
  cache[address.toLowerCase()] = publicKey
  return storePublicKeysCache(cache)
}

export function getPublicKeyFromCache(address: string): string | null {
  const cache = getPublicKeysCache()
  return cache[address.toLowerCase()] || null
}

export function clearPublicKeysCache(): void {
  localStorage.removeItem(STORAGE_KEYS.PUBLIC_KEYS_CACHE)
}

// === Block Number Tracking ===

export function storeLastBlockNumber(blockNumber: number): void {
  localStorage.setItem(STORAGE_KEYS.LAST_BLOCK_NUMBER, blockNumber.toString())
}

export function getLastBlockNumber(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_BLOCK_NUMBER)
  return stored ? parseInt(stored, 10) : 0
}

export function clearLastBlockNumber(): void {
  localStorage.removeItem(STORAGE_KEYS.LAST_BLOCK_NUMBER)
}

// === Sidebar State ===

export function storeSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed.toString())
}

export function getSidebarCollapsed(): boolean {
  const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
  return stored === 'true'
}

// === Storage Management ===

/**
 * Clear all user data (logout)
 */
export function clearUserData(address?: string): void {
  if (address) {
    clearEncryptionKeys(address)
    clearCachedMessages(address)
  }
  clearWalletState()
  clearUserSettings()
  clearPublicKeysCache()
  clearLastBlockNumber()
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number
  available: number
  percentage: number
} {
  try {
    // Estimate localStorage usage
    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }
    
    // Rough estimate of 5MB limit
    const available = 5 * 1024 * 1024
    const percentage = (used / available) * 100
    
    return { used, available, percentage }
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 }
  }
}

export function cleanupStorage(): void {
  try {
    const info = getStorageInfo()
    
    // If storage is over 80% full, clean up
    if (info.percentage > 80) {
      // Clear old cached messages for all addresses
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('zephex_messages_')) {
          const messages = safeParseJSON(localStorage.getItem(key), [])
          if (messages.length > 100) {
            // Keep only the latest 100 messages
            const trimmed = messages.slice(0, 100)
            localStorage.setItem(key, JSON.stringify(trimmed))
          }
        }
      })
      
      console.log('Storage cleanup completed')
    }
  } catch (error) {
    console.error('Storage cleanup failed:', error)
  }
}
export function exportUserData(address: string): {
  encryptionKeys: EncryptionKeys | null
  settings: UserSettings
  messages: CachedMessage[]
  publicKeysCache: Record<string, string>
} {
  return {
    encryptionKeys: getEncryptionKeys(address),
    settings: getUserSettings(),
    messages: getCachedMessages(address),
    publicKeysCache: getPublicKeysCache(),
  }
}

export function importUserData(
  address: string,
  data: {
    encryptionKeys?: EncryptionKeys
    settings?: Partial<UserSettings>
    messages?: CachedMessage[]
    publicKeysCache?: Record<string, string>
  }
): boolean {
  try {
    if (data.encryptionKeys) {
      storeEncryptionKeys(address, data.encryptionKeys)
    }
    
    if (data.settings) {
      storeUserSettings(data.settings)
    }
    
    if (data.messages) {
      storeCachedMessages(address, data.messages)
    }
    
    if (data.publicKeysCache) {
      storePublicKeysCache(data.publicKeysCache)
}
    
    
    return true
  } catch (error) {
    console.error('Failed to import user data:', error)
    return false
  }
}

// Initialize storage cleanup on module load
if (typeof window !== 'undefined') {
  // Run cleanup on load and every hour
  cleanupStorage()
  setInterval(cleanupStorage, 60 * 60 * 1000)
}
