import {ethers} from 'ethers'
import { MESSAGING_CONTRACT_ABI } from '../contracts/abi'
import { CONTRACT_ADDRESSES , MESSAGE_FEE_ETH } from '../utils/constants'

declare global {
    interface Window {
        ethereum?: any
    }
}
export function getContractAddress(chainId: number): string {
    const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!address || address === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Contract not Deployed on Blockchain`)

    }
    return address
}
export function getProvider(): ethers.BrowserProvider {
    if(!window.ethereum) {
        throw new Error('MetaMask not Found')
    }
    return new ethers.BrowserProvider(window.ethereum) 
}
export async function getSigner(): Promise<ethers.JsonRpcSigner> {
    const provider = await getProvider()
    return await provider.getSigner() 
}
export async function getContract(): Promise<ethers.Contract> {
    const signer = await getSigner()
    const network = await signer.provider.getNetwork()
    const chainId= Number(network.chainId) 
    const contractAddress = getContractAddress(chainId)
    return new ethers.Contract(contractAddress, MESSAGING_CONTRACT_ABI, signer)
}
export async function getContractReadOnly(): Promise<ethers.Contract> {
    const provider = getProvider()
    const network = await provider.getNetwork()
    const chainId= Number (network.chainId) 
    const contractAddress= getContractAddress(chainId)
    return new ethers.Contract(contractAddress, MESSAGING_CONTRACT_ABI, provider)
 }
 export async function switchToNetwork(chainId:number): Promise<void> {
    if (!window.ethereum) {
        throw new Error ('Metamask not Found')

    }
    try {
        await window.ethereum.request ({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: `0x${chainId.toString(16)}` }]

        })
    } catch (error:any) {
        if(error.code === 4902) {
            if(chainId=== 11155111) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa36a7',
                        chainName: 'Sepolia Test Network',
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://sepolia.infura.io/v3/'],
                        blockExplorerUrls: ['https//sepolia.etherscan.io/']
                    }]
                })
            }
        }
    }
 }
export async function estimateMessageGas(
  to: string,
  encryptedContent: string,
  nonce: string
): Promise<bigint> {
  try {
    const contract = await getContract()
    return await contract.sendMessage.estimateGas(
      to,
      encryptedContent,
      nonce,
      { value: ethers.parseEther(MESSAGE_FEE_ETH) }
    )
  } catch (error) {
    console.error('Gas estimation failed:', error)
    return BigInt(500000) 
  }
}