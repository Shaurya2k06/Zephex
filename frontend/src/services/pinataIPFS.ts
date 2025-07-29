// Real IPFS Service using Pinata for Zephex Messaging

interface PinataUploadResult {
  cid: string;
  size: number;
}

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class PinataIPFSService {
  private static instance: PinataIPFSService;
  private apiKey: string;
  private apiEndpoint = 'https://api.pinata.cloud';

  private constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || 'cb94f3f9944a7011cf26';
  }

  static getInstance(): PinataIPFSService {
    if (!PinataIPFSService.instance) {
      PinataIPFSService.instance = new PinataIPFSService();
    }
    return PinataIPFSService.instance;
  }

  /**
   * Upload content to IPFS via Pinata
   */
  async uploadContent(content: string): Promise<PinataUploadResult> {
    try {
      // Create a blob from the content
      const blob = new Blob([content], { type: 'application/json' });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `zephex-message-${Date.now()}.json`);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: `zephex-message-${Date.now()}`,
        keyvalues: {
          app: 'zephex',
          type: 'encrypted-message',
          timestamp: Date.now().toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      // Make the upload request
      const response = await fetch(`${this.apiEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata upload error:', errorText);
        throw new Error(`Pinata upload failed: ${response.status} ${response.statusText}`);
      }

      const result: PinataResponse = await response.json();
      
      console.log(`Successfully uploaded to IPFS: ${result.IpfsHash}`);
      
      return {
        cid: result.IpfsHash,
        size: result.PinSize
      };
    } catch (error) {
      console.error('Failed to upload to Pinata:', error);
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Retrieve content from IPFS via Pinata gateway
   */
  async getContent(cid: string): Promise<string | null> {
    try {
      // Use Pinata's IPFS gateway
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      
      if (!response.ok) {
        console.error(`Failed to retrieve from IPFS: ${response.status}`);
        return null;
      }

      const content = await response.text();
      console.log(`Successfully retrieved from IPFS: ${cid}`);
      return content;
    } catch (error) {
      console.error(`Failed to retrieve from IPFS: ${error}`);
      return null;
    }
  }

  /**
   * Test the Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Pinata connection test failed: ${error}`);
      return false;
    }
  }

  /**
   * Get account info and usage stats
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/data/userPinnedDataTotal`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to get account info: ${error}`);
      return null;
    }
  }
}

// Export singleton instance
export const pinataIPFS = PinataIPFSService.getInstance();
