export interface User {
  address: string;
  ensName: string;
  publicKey?: string;
  isConnected: boolean;
}

export interface UserProfile {
  address: string;
  ensName?: string;
  avatar?: string;
  publicKey: string;
}
