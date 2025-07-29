// IPFS Service for Zephex Messaging
// Uses Pinata for real IPFS with mock fallback

import { pinataService } from './ipfs';

interface IPFSUploadResult {
  cid: string;
  size: number;
}

interface IPFSContent {
  content: string;
  timestamp: number;
  encrypted: boolean;
}

export class IPFSService {
  private static instance: IPFSService;
  private mockStorage: Map<string, IPFSContent> = new Map();

  private constructor() {
    // Initialize mock storage with some test data
    this.loadMockData();
  }

  static getInstance(): IPFSService {
    if (!IPFSService.instance) {
      IPFSService.instance = new IPFSService();
    }
    return IPFSService.instance;
  }

  /**
   * Upload encrypted content to IPFS (uses Pinata with mock fallback)
   */
  async uploadContent(content: string): Promise<IPFSUploadResult> {
    try {
      // Try Pinata first for real IPFS
      try {
        console.log('Attempting to upload to Pinata IPFS...');
        const result = await pinataService.uploadContent(content);
        
        // Also store in mock storage as backup
        this.mockStorage.set(result.cid, {
          content,
          timestamp: Date.now(),
          encrypted: true
        });
        this.persistToLocalStorage();
        
        return result;
      } catch (pinataError) {
        console.warn('Pinata upload failed, using mock IPFS:', pinataError);
        
        // Fall back to mock implementation with shorter CID
        await new Promise(resolve => setTimeout(resolve, 500));

        const cid = this.generateMockCID(content);
        
        this.mockStorage.set(cid, {
          content,
          timestamp: Date.now(),
          encrypted: true
        });

        this.persistToLocalStorage();

        console.log(`Mock IPFS upload completed: ${cid}`);

        return {
          cid,
          size: new Blob([content]).size
        };
      }
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Retrieve content from IPFS by CID (uses Pinata with mock fallback)
   */
  async getContent(cid: string): Promise<string | null> {
    try {
      // Try Pinata first
      try {
        console.log(`Attempting to retrieve from Pinata: ${cid}`);
        const content = await pinataService.getContent(cid);
        if (content) {
          return content;
        }
      } catch (pinataError) {
        console.warn('Pinata retrieval failed, using mock storage:', pinataError);
      }

      // Fall back to mock storage
      await new Promise(resolve => setTimeout(resolve, 200));

      const stored = this.mockStorage.get(cid);
      
      if (stored) {
        console.log(`Mock IPFS retrieval successful: ${cid}`);
        return stored.content;
      }
      
      console.warn(`Content not found: ${cid}`);
      return null;
    } catch (error) {
      console.error(`Failed to retrieve from IPFS: ${error}`);
      return null;
    }
  }

  /**
   * Check if content exists on IPFS
   */
  async exists(cid: string): Promise<boolean> {
    return this.mockStorage.has(cid);
  }

  /**
   * Get IPFS content metadata
   */
  async getMetadata(cid: string): Promise<{ size: number; timestamp: number } | null> {
    const stored = this.mockStorage.get(cid);
    if (!stored) return null;

    return {
      size: new Blob([stored.content]).size,
      timestamp: stored.timestamp
    };
  }

  /**
   * Pin content to ensure it stays available (mock implementation)
   */
  async pinContent(cid: string): Promise<boolean> {
    // In real implementation, this would pin content to IPFS nodes
    const exists = await this.exists(cid);
    if (exists) {
      console.log(`Pinned content: ${cid}`);
      return true;
    }
    return false;
  }

  /**
   * Get statistics about stored content
   */
  getStats(): { totalItems: number; totalSize: number } {
    let totalSize = 0;
    for (const [, content] of this.mockStorage) {
      totalSize += new Blob([content.content]).size;
    }

    return {
      totalItems: this.mockStorage.size,
      totalSize
    };
  }

  /**
   * Generate a mock IPFS CID (shorter format for contract compatibility)
   */
  private generateMockCID(content: string): string {
    // Create a simple hash of the content for consistency
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Add timestamp to ensure uniqueness but keep it short
    const timestamp = Date.now().toString(36).substring(-6); // Last 6 chars
    const hashStr = Math.abs(hash).toString(36);
    
    // Format as IPFS CID v1 (shorter format)
    // Real IPFS CIDs are typically 46-59 characters
    const cid = `Qm${hashStr}${timestamp}${Math.random().toString(36).substring(2, 8)}`;
    
    // Ensure it's under 200 characters (contract limit)
    return cid.substring(0, 46); // Standard IPFS CID length
  }

  /**
   * Persist mock data to localStorage
   */
  private persistToLocalStorage(): void {
    try {
      const data = Array.from(this.mockStorage.entries());
      localStorage.setItem('zephex_ipfs_mock', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist IPFS mock data:', error);
    }
  }

  /**
   * Load mock data from localStorage
   */
  private loadMockData(): void {
    try {
      const stored = localStorage.getItem('zephex_ipfs_mock');
      if (stored) {
        const data = JSON.parse(stored);
        this.mockStorage = new Map(data);
      }
    } catch (error) {
      console.warn('Failed to load IPFS mock data:', error);
      this.mockStorage = new Map();
    }
  }

  /**
   * Clear all mock data (for testing/development)
   */
  clearMockData(): void {
    this.mockStorage.clear();
    localStorage.removeItem('zephex_ipfs_mock');
  }
}

// Export singleton instance
export const ipfsService = IPFSService.getInstance();
