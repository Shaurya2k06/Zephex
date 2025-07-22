export interface ContractMessage {
  from: string;
  to: string;
  encryptedContent: string;
  timestamp: bigint;
  nonce: string;
}

export interface MessageEvent {
  from: string;
  to: string;
  encryptedContent: string;
  timestamp: bigint;
  nonce: string;
  blockNumber: number;
  transactionHash: string;
}

export interface ContractConfig {
  address: string;
  abi: any[];
  chainId: number;
}
