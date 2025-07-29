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
  private secretKey: string;
  private apiEndpoint = 'https://api.pinata.cloud';

  private constructor() {
    // Use environment variables for API credentials
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY;
    this.secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
    
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata API credentials not found in environment variables');
    }
  }

  static getInstance(): PinataService {
    if (!PinataService.instance) {
      PinataService.instance = new PinataService();
    }
    return PinataService.instance;
  }

  /**
   * Upload encrypted content to IPFS via Pinata
   */
  async uploadContent(content: string): Promise<PinataUploadResult> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      console.log('📤 Uploading encrypted message to IPFS...');
      
      // Create a JSON object with the encrypted content
      const messageData = {
        encryptedContent: content,
        timestamp: Date.now(),
        version: '3.0',
        app: 'zephex'
      };
      
      // Create a blob from the JSON data
      const blob = new Blob([JSON.stringify(messageData)], { type: 'application/json' });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `zephex-msg-${Date.now()}.json`);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: `zephex-message-${Date.now()}`,
        keyvalues: {
          app: 'zephex',
          type: 'encrypted-message',
          timestamp: Date.now().toString(),
          version: '3.0'
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Add pinning options
      const options = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
          regions: [
            {
              id: 'FRA1',
              desiredReplicationCount: 1
            }
          ]
        }
      });
      formData.append('pinataOptions', options);

      // Make the request with JWT authentication
      const response = await fetch(`${this.apiEndpoint}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
          // Note: Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinata upload failed:', response.status, errorText);
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result: PinataResponse = await response.json();
      
      console.log('✅ Successfully uploaded to IPFS with CID:', result.IpfsHash);
      
      return {
        cid: result.IpfsHash,
        size: result.PinSize
      };
      
    } catch (error: any) {
      console.error('❌ Failed to upload to Pinata IPFS:', error);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve content from IPFS via Pinata gateway
   */
  async getContent(cid: string): Promise<string | null> {
    try {
      console.log('📥 Retrieving content from IPFS:', cid);
      
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      
      if (!response.ok) {
        console.error('❌ Failed to retrieve from IPFS:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      // Extract the encrypted content from the stored JSON
      if (data.encryptedContent) {
        console.log('✅ Successfully retrieved encrypted content from IPFS');
        return data.encryptedContent;
      } else {
        // Fallback for old format
        console.log('✅ Retrieved content from IPFS (legacy format)');
        return JSON.stringify(data);
      }
      
    } catch (error) {
      console.error('❌ Error retrieving content from IPFS:', error);
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
      return false;
    }
  }

  /**
   * Test the Pinata connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.error('Pinata API key not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/data/testAuthentication`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const isValid = response.ok;
      console.log('🔐 Pinata connection test:', isValid ? '✅ SUCCESS' : '❌ FAILED');
      return isValid;
    } catch (error) {
      console.error(`❌ Pinata connection test failed: ${error}`);
      return false;
    }
  }
}

// Export singleton instance
export const pinataService = PinataService.getInstance();
