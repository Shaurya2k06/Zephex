import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessagesV3 } from '../../contexts/MessageContextV3';
import { useWallet } from '../../contexts/WalletContext';
import { ComicText } from '../magicui/comic-text';

interface ContactsListProps {
  selectedContact: string;
  onSelectContact: (contact: string) => void;
}

export function ContactsList({ selectedContact, onSelectContact }: ContactsListProps) {
  const { user } = useWallet();
  const { conversations, isLoading } = useMessagesV3();
  const [newContact, setNewContact] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddContact = () => {
    if (newContact.trim() && isValidAddress(newContact.trim())) {
      onSelectContact(newContact.trim());
      setNewContact('');
      setShowAddForm(false);
    }
  };

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getLastMessage = (contact: string) => {
    const msgs = conversations[contact] || [];
    return msgs[msgs.length - 1];
  };

  const sortedContacts = Object.keys(conversations).sort((a, b) => {
    const lastA = getLastMessage(a);
    const lastB = getLastMessage(b);
    if (!lastA && !lastB) return 0;
    if (!lastA) return 1;
    if (!lastB) return -1;
    return lastB.timestamp - lastA.timestamp;
  });

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-sm">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-r from-purple-300 to-pink-400 border-b-4 border-black">
        <div className="flex items-center justify-between mb-3">
          <ComicText fontSize={1.2} className="text-black">
            CONTACTS
          </ComicText>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all font-bold ${
              showAddForm 
                ? 'bg-red-300 text-red-800' 
                : 'bg-green-300 text-green-800'
            }`}
          >
            {showAddForm ? '✕' : '+ ADD'}
          </button>
        </div>

        {/* Add Contact Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/90 p-3 rounded-xl border-2 border-black transform -skew-x-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="transform skew-x-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter wallet address (0x...)"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-lg text-sm font-bold bg-white/90 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder-gray-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddContact}
                      disabled={!newContact.trim() || !isValidAddress(newContact.trim())}
                      className="flex-1 px-3 py-2 bg-blue-400 text-blue-900 rounded-lg text-sm font-bold hover:bg-blue-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all disabled:bg-gray-300 disabled:text-gray-600 disabled:transform-none"
                    >
                      🚀 START CHAT
                    </button>
                  </div>
                  {newContact.trim() && !isValidAddress(newContact.trim()) && (
                    <div className="text-red-600 text-xs font-bold">
                      ⚠️ Invalid address format
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="bg-white/90 border-2 border-black rounded-xl p-4 transform -skew-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="transform skew-x-2 flex items-center justify-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="font-bold text-gray-700">Loading conversations...</span>
              </div>
            </div>
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="p-6 text-center">
            <div className="bg-gradient-to-r from-yellow-200 to-orange-300 border-3 border-black rounded-xl p-6 transform -skew-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="transform skew-x-3">
                <div className="text-4xl mb-3">👋</div>
                <div className="font-black text-yellow-800 text-lg mb-2">
                  NO CONVERSATIONS YET!
                </div>
                <div className="text-yellow-700 text-sm font-bold">
                  Click "ADD" to start your first epic chat!
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedContacts.map((contact) => {
              const lastMessage = getLastMessage(contact);
              const isSelected = selectedContact === contact;
              const hasUnread = false; // TODO: Implement unread tracking
              
              return (
                <motion.div
                  key={contact}
                  onClick={() => onSelectContact(contact)}
                  className={`p-4 cursor-pointer transition-all transform hover:scale-102 hover:z-10 relative ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-200 to-cyan-300 border-l-4 border-l-blue-600 shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]' 
                      : 'hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 border-l-2 border-l-transparent'
                  }`}
                  whileHover={{ x: isSelected ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Contact Header */}
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="bg-white/80 px-2 py-1 rounded-lg border-2 border-black inline-flex items-center space-x-1">
                          <span className="text-sm">👤</span>
                          <span className="font-black text-sm text-gray-900">
                            {formatAddress(contact)}
                          </span>
                        </div>
                        {hasUnread && (
                          <div className="w-2 h-2 bg-red-500 rounded-full border border-black"></div>
                        )}
                      </div>
                      
                      {/* Last Message Preview */}
                      {lastMessage ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-700 font-medium bg-gray-100/70 px-2 py-1 rounded border border-gray-400 truncate">
                            {lastMessage.sender === user?.address ? '📤 You: ' : '📥 '}
                            {lastMessage.cid ? 'Encrypted message' : 'Message'}
                          </div>
                          <div className="text-xs text-gray-500 font-bold">
                            {formatTime(lastMessage.timestamp)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-bold italic">
                          No messages yet
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-blue-600 rounded-full border border-black"
                      />
                    )}
                  </div>

                  {/* Hover Effect Background */}
                  {!isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-200/50 to-pink-200/50 rounded-lg border-2 border-transparent"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
