export interface Message {
  id: string;
  from: string;
  to: string;
  encryptedContent: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
  nonce: string;
}

export interface DecryptedMessage extends Omit<Message, 'encryptedContent'> {
  content: string;
  isDecrypted: boolean;
}

export interface MessageComposerData {
  to: string;
  content: string;
}

export interface EncryptionKey {
  publicKey: string;
  privateKey?: string;
}
