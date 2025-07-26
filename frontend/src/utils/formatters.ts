import {ethers} from 'ethers'
export function formatAddress(address: string, startChars: number= 6, endChars: number = 4): string {
    if(!address) return ''
    if(!ethers.isAddress(address)) return address
    return `${address.slice(0,startChars)}...${address.slice(-endChars)}`
}
export function formatBalance(balance:string, decimals:number=4): string {
    try {
        const num= parseFloat(balance)
        if (num===0) return '0Eth'
        if (num<0.001) return '<0.001 Eth'
        if (num>=1000) return `${(num/1000).toFixed(1)}K ETH`

        return `${num.toFixed(decimals)}ETH`
    } catch {
        return '0 ETH'
    }
}

export function formatWeiToEth(wei: bigint | string, decimals: number = 4): string {
    try {
        const ethValue= ethers.formatEther(wei)
        return formatBalance(ethValue, decimals)
    } catch {
        return '0ETH'
    }
}
export function formatEthToWei(eth: string): bigint {
    try {
        return ethers.parseEther(eth)
    } catch {
        return BigInt(0)
    }
}
export function formatGasPrice(gasPrice: bigint | string ): string {
    try {
        const gwei = ethers.formatUnits(gasPrice, 'gwei')
        const num = parseFloat(gwei)
        return `${num.toFixed(2)} gwei`
    } catch {
        return '0 GWEI'
    }
}
export function formatGasCost(gasUsed: bigint | string, gasPrice:bigint | string ): string {
    try {
        const gasCost = BigInt(gasUsed) * BigInt(gasPrice)
        return formatWeiToEth(gasCost, 6)
    } catch {
        return '0ETH'
    }
}
export function formatTimestamp(timestamp:number): string {
    try {
        const date= new Date(timestamp * 1000) 
        return date.toLocaleString()
    } catch {
        return 'Invalid Date'
    }
}

export function formatRelativeTime(timestamp: number): string {
    try {
        const now = Date.now()
        const messageTime = timestamp *1000
        const diff = now-messageTime
        const seconds = Math.floor(diff/1000)
        const minutes = Math.floor(seconds/60)
        const hours= Math.floor(minutes/60)
        const days= Math.floor(hours/24)
        if(seconds<60) return 'Just Now'
        if(minutes<60) return `${minutes}m age`
        if(hours<24) return `${hours}h ago`
        if (days<7) return `${days}d ago`
        return formatTimestamp(timestamp)
    } catch {
        return 'Unknown'
    }
}
export function formatMessageContent(content: string, maxLength: number = 100): string {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return `${content.slice(0, maxLength)}...`
}

export function formatTxHash(hash: string, startChars: number = 8, endChars: number = 8): string {
  if (!hash) return ''
  if (hash.length < startChars + endChars) return hash
  
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`
}

export function formatNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    31337: 'Local Network',
    137: 'Polygon',
    56: 'BSC',
    43114: 'Avalanche'
  }
  
  return networks[chainId] || `Chain ${chainId}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toString()
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function formatBlockNumber(blockNumber: number): string {
  if (blockNumber === 0) return 'Pending'
  return `#${blockNumber.toLocaleString()}`
}

export function formatNonce(nonce: string, maxLength: number = 16): string {
  if (!nonce) return ''
  if (nonce.length <= maxLength) return nonce
  return `${nonce.slice(0, maxLength)}...`
}

export function formatPublicKey(publicKey: string): string {
  if (!publicKey) return ''
  return formatAddress(publicKey, 8, 8)
}

export function formatError(error: any): string {
  if (!error) return 'Unknown error'
  
  if (typeof error === 'string') return error
  
  if (error.message) return error.message
  if (error.reason) return error.reason
  if (error.data?.message) return error.data.message
  
  return 'An unexpected error occurred'
}
export function formatContractAddress(address: string, chainId: number): string {
  const networkName = formatNetworkName(chainId)
  return `${formatAddress(address)} (${networkName})`
}


export function formatUSD(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount)
}


export function formatLoadingText(isLoading: boolean, loadingText: string, defaultText: string): string {
  return isLoading ? loadingText : defaultText
}


export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
export function formatEnumValue(value: string): string {
  return value
    .split('_')
    .map(word => capitalize(word.toLowerCase()))
    .join(' ')
}
