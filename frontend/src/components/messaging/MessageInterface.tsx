import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComicText } from '../magicui/comic-text';
import { useMessagesV3 } from '../../contexts/MessageContextV3';
import { useWallet } from '../../contexts/WalletContext';

interface MessageInterfaceProps {
  selectedContact: string;
  onBack: () => void;
}

export function MessageInterface({ selectedContact, onBack }: MessageInterfaceProps) {
  const { user } = useWallet();
  const { 
    sendMessage, 
    getConversation, 
    isSending, 
    isLoading, 
    error, 
    clearError,
    canSendMessage 
  } = useMessagesV3();
  
  const [messageText, setMessageText] = useState('');
  const [canSend, setCanSend] = useState({ canSend: true, reason: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const conversation = getConversation(selectedContact);

  // Check if user can send message
  useEffect(() => {
    const checkCanSend = async () => {
      if (user?.address) {
        const result = await canSendMessage(user.address);
        setCanSend(result);
      }
    };
    checkCanSend();
  }, [user?.address, canSendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !canSend.canSend) return;

    try {
      await sendMessage(selectedContact, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-cyan-300 to-blue-400 border-b-4 border-black">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="md:hidden p-2 bg-white/80 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
          >
            ←
          </button>
          
          <div className="flex-1 bg-white/90 p-3 rounded-xl border-2 border-black transform -skew-x-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mx-2">
            <div className="transform skew-x-3">
              <div className="font-black text-gray-900 text-lg">
                💬 CHATTING WITH
              </div>
              <div className="font-mono text-sm text-gray-700">
                {formatAddress(selectedContact)}
              </div>
            </div>
          </div>

          {!canSend.canSend && (
            <div className="bg-red-300 border-2 border-red-600 rounded-lg px-3 py-1 transform -skew-x-2">
              <div className="text-red-800 text-xs font-bold transform skew-x-2">
                {canSend.reason}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-red-200 border-b-2 border-red-600"
          >
            <div className="flex justify-between items-center">
              <div className="text-red-800 font-bold text-sm">
                ⚠️ ERROR: {error}
              </div>
              <button
                onClick={clearError}
                className="bg-red-600 text-white px-2 py-1 rounded border border-black text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="bg-white/90 p-6 rounded-2xl border-3 border-gray-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="font-bold text-gray-700">Loading messages...</span>
              </div>
            </div>
          </div>
        ) : conversation.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="bg-white/90 p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <ComicText fontSize={1.2} className="mb-3">
                NO MESSAGES YET!
              </ComicText>
              <div className="text-gray-600 font-bold">
                Start the conversation by sending the first message!
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {conversation.map((message, index) => {
              const isOwn = message.sender === user?.address;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform ${
                      isOwn
                        ? 'bg-gradient-to-r from-green-300 to-emerald-400 skew-x-2'
                        : 'bg-gradient-to-r from-pink-300 to-purple-400 -skew-x-2'
                    }`}
                  >
                    <div className={`transform ${isOwn ? '-skew-x-2' : 'skew-x-2'}`}>
                      <div className="font-bold text-gray-900 break-words">
                        {message.cid || "Encrypted message"}
                      </div>
                      <div className={`text-xs mt-2 font-medium flex justify-between items-center ${
                        isOwn ? 'text-green-800' : 'text-purple-800'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        <span className="text-xs opacity-75">
                          {isOwn ? '📤 Sent' : '📥 Received'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 border-t-4 border-black">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={canSend.canSend ? "Type your epic message here!" : canSend.reason}
            className="flex-1 px-4 py-3 border-3 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold bg-white/95 placeholder-gray-600 text-black disabled:bg-gray-200 disabled:text-gray-500"
            disabled={isSending || !canSend.canSend}
            maxLength={280}
          />
          
          <button
            type="submit"
            disabled={!messageText.trim() || isSending || !canSend.canSend}
            className="px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl disabled:from-gray-400 disabled:to-gray-500 hover:from-red-500 hover:to-pink-600 border-3 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 transition-all disabled:transform-none disabled:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isSending ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                SENDING
              </span>
            ) : (
              '🚀 SEND!'
            )}
          </button>
        </form>
        
        {messageText.length > 200 && (
          <div className="mt-2 text-xs font-bold text-orange-800">
            {280 - messageText.length} characters remaining
          </div>
        )}
      </div>
    </div>
  );
}
