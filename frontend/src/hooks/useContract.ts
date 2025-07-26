import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { getContract, getContractReadOnly, estimateMessageGas } from '../services/web3Service'

export interface ContractInfo {
  address: string
  isConnected: boolean
  chainId: number
}

export function useContractInfo() {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const updateContractInfo = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const contract = await getContractReadOnly()
      const provider = contract.runner?.provider as ethers.Provider
      const network = await provider.getNetwork()

      setContractInfo({
        address: await contract.getAddress(),
        isConnected: true,
        chainId: Number(network.chainId)
      })
    } catch (err: any) {
      setError(err.message || 'Failed to get contract info')
      setContractInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    updateContractInfo()
  }, [updateContractInfo])

  return {
    contractInfo,
    isLoading,
    error,
    refreshContractInfo: updateContractInfo
  }
}

export function useContractWrite() {
  const [isWriting, setIsWriting] = useState(false)
  const [error, setError] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')

  const writeContract = useCallback(async (
    methodName: string,
    args: any[],
    options: { value?: string } = {}
  ) => {
    setIsWriting(true)
    setError('')
    setTxHash('')

    try {
      const contract = await getContract()
      const method = contract[methodName]
      
      if (!method) {
        throw new Error(`Method ${methodName} not found on contract`)
      }

      const tx = await method(...args, options)
      setTxHash(tx.hash)
      
      const receipt = await tx.wait()
      return {
        hash: tx.hash,
        receipt,
        success: receipt.status === 1
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
      throw err
    } finally {
      setIsWriting(false)
    }
  }, [])

  return {
    writeContract,
    isWriting,
    error,
    txHash
  }
}

export function useContractRead() {
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string>('')

  const readContract = useCallback(async (
    methodName: string,
    args: any[] = []
  ) => {
    setIsReading(true)
    setError('')

    try {
      const contract = await getContractReadOnly()
      const method = contract[methodName]
      
      if (!method) {
        throw new Error(`Method ${methodName} not found on contract`)
      }

      const result = await method(...args)
      return result
    } catch (err: any) {
      setError(err.message || 'Read operation failed')
      throw err
    } finally {
      setIsReading(false)
    }
  }, [])

  return {
    readContract,
    isReading,
    error
  }
}

export function useGasEstimation() {
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState<string>('')

  const estimateGas = useCallback(async (
    methodName: string,
    args: any[],
    options: { value?: string } = {}
  ) => {
    setIsEstimating(true)
    setError('')

    try {
      const contract = await getContract()
      const method = contract[methodName]
      
      if (!method) {
        throw new Error(`Method ${methodName} not found on contract`)
      }

      const gasEstimate = await method.estimateGas(...args, options)
      return gasEstimate
    } catch (err: any) {
      setError(err.message || 'Gas estimation failed')
      throw err
    } finally {
      setIsEstimating(false)
    }
  }, [])

  const estimateMessageGasHook = useCallback(async (
    to: string,
    encryptedContent: string,
    nonce: string
  ) => {
    return await estimateMessageGas(to, encryptedContent, nonce)
  }, [])

  return {
    estimateGas,
    estimateMessageGas: estimateMessageGasHook,
    isEstimating,
    error
  }
}

export function useContractEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string>('')

  const startListening = useCallback(async (
    eventName: string,
    callback?: (event: any) => void
  ) => {
    setIsListening(true)
    setError('')

    try {
      const contract = await getContractReadOnly()
      const eventFilter = contract.filters[eventName]
      
      if (!eventFilter) {
        throw new Error(`Event ${eventName} not found on contract`)
      }

      const handleEvent = (event: any) => {
        setEvents(prev => [event, ...prev])
        if (callback) callback(event)
      }

      contract.on(eventFilter(), handleEvent)
      
      return () => {
        contract.off(eventFilter(), handleEvent)
        setIsListening(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start listening to events')
      setIsListening(false)
      throw err
    }
  }, [])

  const stopListening = useCallback(async (eventName: string) => {
    try {
      const contract = await getContractReadOnly()
      contract.removeAllListeners(eventName)
      setIsListening(false)
    } catch (err: any) {
      setError(err.message || 'Failed to stop listening to events')
    }
  }, [])

  return {
    events,
    startListening,
    stopListening,
    isListening,
    error,
    clearEvents: () => setEvents([])
  }
}
