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

export class PinataService {
  private static instance: PinataService;
  private apiKey: string;
  private apiEndpoint = 'https://api.pinata.cloud';

  private constructor() {
    // Use the provided Pinata API key
    this.apiKey = 'cb94f3f9944a7011cf26';
  }

  static getInstance(): PinataService {
    if (!PinataService.instance) {
      PinataService.instance = new PinataService();
    }
    return PinataService.instance;
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
      formData.append('file', blob, 'message.json');
      
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
      
      // Pin options
      const options = JSON.stringify({
        cidVersion: 1,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 2
            }
          ]
        }
      });
      formData.append('pinataOptions', options);

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

      return await response.text();
    } catch (error) {
      console.error(`Failed to retrieve from IPFS: ${error}`);
      return null;
    }
  }

  /**
   * Check if content exists on IPFS
   */
  async exists(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, {
        method: 'HEAD'
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Failed to check IPFS existence: ${error}`);
      return false;
    }
  }

  /**
   * Get pin metadata from Pinata
   */
  async getMetadata(cid: string): Promise<{ size: number; timestamp: number } | null> {
    try {
      const response = await fetch(`${this.apiEndpoint}/data/pinList?hashContains=${cid}&status=pinned`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (data.rows && data.rows.length > 0) {
        const pin = data.rows[0];
        return {
          size: pin.size,
          timestamp: new Date(pin.date_pinned).getTime()
        };
      }

      return null;
    } catch (error) {
      console.error(`Failed to get metadata: ${error}`);
      return null;
    }
  }

  /**
   * Unpin content from Pinata (cleanup)
   */
  async unpinContent(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/pinning/unpin/${cid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to unpin content: ${error}`);
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
}

// Export singleton instance
export const pinataService = PinataService.getInstance();
