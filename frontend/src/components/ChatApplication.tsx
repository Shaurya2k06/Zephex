import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { MessageProviderV3 } from '../contexts/MessageContextV3';
import { ContactsList } from './messaging/ContactsList';
import { MessageInterface } from './messaging/MessageInterface';
import { WalletManager } from './wallet/WalletManager';
import { ComicText } from './magicui/comic-text';
import { DotPattern } from './magicui/dot-pattern';

export function ChatApplication() {
  const { user } = useWallet();
  const [selectedContact, setSelectedContact] = useState('');
  const [showWallet, setShowWallet] = useState(false);
  const [showMobileContacts, setShowMobileContacts] = useState(true);

  const handleSelectContact = (contact: string) => {
    setSelectedContact(contact);
    setShowMobileContacts(false); // Hide contacts on mobile when chat is selected
  };

  const handleBackToContacts = () => {
    setShowMobileContacts(true);
    setSelectedContact('');
  };

  const handleDisconnect = () => {
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_address');
    window.location.reload();
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <MessageProviderV3>
      <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex relative overflow-hidden">
        <DotPattern className="opacity-20" width={24} height={24} />
        
        {/* Desktop Layout */}
        <div className="hidden md:flex w-full h-full relative z-10">
          {/* Sidebar */}
          <div className="w-80 bg-white/90 backdrop-blur-sm border-r-4 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-yellow-300 to-orange-400 border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/Zephex.png" 
                  alt="Zephex Logo" 
                  className="w-8 h-8 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <ComicText fontSize={1.2} className="text-black">
                  ZEPHEX
                </ComicText>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowWallet(true)}
                  className="px-3 py-1 text-sm font-bold bg-blue-200 text-blue-800 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
                >
                  💰 WALLET
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 text-sm font-bold bg-red-300 text-red-800 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
                >
                  🚪 EXIT
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b-2 border-black bg-gradient-to-r from-indigo-200 to-pink-200">
              <div className="bg-white/80 p-3 rounded-xl border-2 border-black transform skew-x-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="transform -skew-x-2">
                  <div className="text-xs font-bold text-indigo-700">🧙‍♂️ PLAYER:</div>
                  <div className="text-sm font-mono font-bold text-indigo-900">
                    {formatAddress(user?.address)}
                  </div>
                </div>
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-hidden">
              <ContactsList 
                selectedContact={selectedContact}
                onSelectContact={handleSelectContact}
              />
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm">
            {selectedContact ? (
              <MessageInterface 
                selectedContact={selectedContact}
                onBack={handleBackToContacts}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform max-w-md"
                >
                  <div className="mb-6 flex justify-center">
                    <img 
                      src="/Zephex.png" 
                      alt="Zephex Logo" 
                      className="w-20 h-20 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse"
                    />
                  </div>
                  <ComicText fontSize={1.5} className="mb-4">
                    WELCOME TO ZEPHEX!
                  </ComicText>
                  <div className="bg-gradient-to-r from-purple-200 to-pink-200 p-4 rounded-xl border-2 border-black transform -skew-x-3">
                    <div className="transform skew-x-3">
                      <div className="text-lg font-bold text-purple-800 mb-2">🚀 Ready to Chat?</div>
                      <div className="text-sm font-medium text-purple-700">
                        Select a conversation or add a new contact to start your epic messaging adventure! 
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden w-full h-full relative z-10">
          <AnimatePresence mode="wait">
            {showMobileContacts ? (
              <motion.div
                key="contacts"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="h-full flex flex-col bg-white/90 backdrop-blur-sm"
              >
                {/* Mobile Header */}
                <div className="p-4 bg-gradient-to-r from-yellow-300 to-orange-400 border-b-4 border-black">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src="/Zephex.png" 
                        alt="Zephex Logo" 
                        className="w-6 h-6 rounded border border-black"
                      />
                      <ComicText fontSize={1} className="text-black">
                        ZEPHEX
                      </ComicText>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowWallet(true)}
                        className="px-2 py-1 text-xs font-bold bg-blue-200 text-blue-800 rounded border border-black"
                      >
                        💰
                      </button>
                      <button
                        onClick={handleDisconnect}
                        className="px-2 py-1 text-xs font-bold bg-red-300 text-red-800 rounded border border-black"
                      >
                        🚪
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile User Info */}
                  <div className="bg-white/80 p-2 rounded-lg border border-black">
                    <div className="text-xs font-bold text-gray-800">
                      👤 {formatAddress(user?.address)}
                    </div>
                  </div>
                </div>

                {/* Mobile Contacts */}
                <div className="flex-1 overflow-hidden">
                  <ContactsList 
                    selectedContact={selectedContact}
                    onSelectContact={handleSelectContact}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="h-full"
              >
                {selectedContact && (
                  <MessageInterface 
                    selectedContact={selectedContact}
                    onBack={handleBackToContacts}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wallet Manager Modal */}
        <AnimatePresence>
          {showWallet && (
            <WalletManager onClose={() => setShowWallet(false)} />
          )}
        </AnimatePresence>
      </div>
    </MessageProviderV3>
  );
}
