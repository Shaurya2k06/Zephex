import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ethers } from 'ethers';
import { MessageServiceV3 } from '../services/messageServiceV3';
import type { MessageV3 } from '../services/messageServiceV3';
import { useWallet } from './WalletContext';

interface MessageContextV3Type {
  messages: MessageV3[];
  conversations: Record<string, MessageV3[]>;
  sendMessage: (to: string, content: string) => Promise<void>;
  getConversation: (address: string) => MessageV3[];
  refreshMessages: () => Promise<void>;
  isSending: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  canSendMessage: (address: string) => Promise<{ canSend: boolean; reason: string }>;
  messageService: MessageServiceV3 | null;
}

const MessageContextV3 = createContext<MessageContextV3Type | undefined>(undefined);

interface MessageProviderV3Props {
  children: ReactNode;
}

export function MessageProviderV3({ children }: MessageProviderV3Props) {
  const { user } = useWallet();
  const [messages, setMessages] = useState<MessageV3[]>([]);
  const [conversations, setConversations] = useState<Record<string, MessageV3[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageService, setMessageService] = useState<MessageServiceV3 | null>(null);

  // Initialize message service when wallet connects
  useEffect(() => {
    if (user?.isConnected && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const service = new MessageServiceV3(provider, 11155111); // Sepolia chain ID
        setMessageService(service);
        
        // Set up message listener
        service.onNewMessage((newMessage) => {
          setMessages(prev => [...prev, newMessage]);
          updateConversations(newMessage);
        });
        
        return () => {
          service.removeListeners();
        };
      } catch (error) {
        console.error('Failed to initialize message service:', error);
        setError('Failed to initialize messaging system');
      }
    } else {
      setMessageService(null);
    }
  }, [user]);

  // Load messages when service is ready
  useEffect(() => {
    if (messageService && user?.address) {
      refreshMessages();
    }
  }, [messageService, user?.address]);

  const updateConversations = (message: MessageV3) => {
    const contactAddress = message.sender === user?.address ? message.receiver : message.sender;
    
    setConversations(prev => ({
      ...prev,
      [contactAddress]: [...(prev[contactAddress] || []), message].sort((a, b) => a.timestamp - b.timestamp)
    }));
  };

  const refreshMessages = async () => {
    if (!messageService || !user?.address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get both sent and received messages
      const [sentMessages, receivedMessages] = await Promise.all([
        messageService.getMessages(user.address, true),
        messageService.getMessages(user.address, false)
      ]);
      
      const allMessages = [...sentMessages, ...receivedMessages]
        .sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(allMessages);
      
      // Group messages by conversation
      const newConversations: Record<string, MessageV3[]> = {};
      
      for (const message of allMessages) {
        const contactAddress = message.sender === user.address ? message.receiver : message.sender;
        
        if (!newConversations[contactAddress]) {
          newConversations[contactAddress] = [];
        }
        newConversations[contactAddress].push(message);
      }
      
      setConversations(newConversations);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (to: string, content: string) => {
    if (!messageService || !user?.address) {
      throw new Error('Message service not available');
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      // Check if user can send message
      const { canSend, reason } = await messageService.canSendMessage(user.address);
      if (!canSend) {
        throw new Error(`Cannot send message: ${reason}`);
      }
      
      const txHash = await messageService.sendMessage(to, content);
      console.log('Message sent, tx hash:', txHash);
      
      // Message will be added via the event listener
      // But we can optimistically add it to the UI
      const optimisticMessage: MessageV3 = {
        sender: user.address,
        receiver: to,
        cid: 'pending...', // Will be updated when event fires
        timestamp: Math.floor(Date.now() / 1000),
        messageId: Date.now() // Temporary ID
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      updateConversations(optimisticMessage);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const getConversation = (contactAddress: string): MessageV3[] => {
    return conversations[contactAddress] || [];
  };

  const canSendMessage = async (address: string) => {
    if (!messageService) {
      return { canSend: false, reason: 'Message service not available' };
    }
    
    try {
      return await messageService.canSendMessage(address);
    } catch (error) {
      return { canSend: false, reason: 'Error checking message status' };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: MessageContextV3Type = {
    messages,
    conversations,
    sendMessage,
    getConversation,
    refreshMessages,
    isSending,
    isLoading,
    error,
    clearError,
    canSendMessage,
    messageService
  };

  return (
    <MessageContextV3.Provider value={value}>
      {children}
    </MessageContextV3.Provider>
  );
}

export function useMessagesV3() {
  const context = useContext(MessageContextV3);
  if (context === undefined) {
    throw new Error('useMessagesV3 must be used within a MessageProviderV3');
  }
  return context;
}
