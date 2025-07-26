import { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { MessageProvider, useMessages } from './contexts/MessageContext'
import { useWalletBalance, useWalletOperations } from './hooks/useWalletBalance'
import { ComicText } from './components/magicui/comic-text'
import { DotPattern } from './components/magicui/dot-pattern'
import './App.css'

// Comic Loading Spinner Component
function ComicLoader() {
  return (
    <div className="inline-flex items-center space-x-1">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  )
}

// Simple wallet connection component
function WalletConnect() {
  const { connectWallet, isConnecting, error } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-purple-400 to-blue-500 flex items-center justify-center relative overflow-hidden">
      <DotPattern 
        className="opacity-30" 
        width={32} 
        height={32} 
        glow={true}
      />
      
          <div className="bg-white p-8 rounded-3xl border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-10 transform hover:scale-105 transition-transform duration-300 animate-float">
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full border-2 border-black animate-bounce"></div>
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-pink-400 rounded-full border-2 border-black animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-3 -left-2 w-5 h-5 bg-blue-400 rounded-full border-2 border-black animate-bounce" style={{ animationDelay: '1s' }}></div>
            
            <div className="mb-8 text-center">
              <ComicText fontSize={2.5} className="mb-4">
                ZEPHEX!
              </ComicText>
              <div className="text-lg font-bold text-gray-700 transform -skew-x-12 bg-yellow-200 px-4 py-2 rounded-lg border-2 border-black animate-pulse-glow">
                💬 Epic Messaging Platform! 💬
              </div>
            </div>                    <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-2xl font-bold text-xl transition-all duration-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover-lift animate-pulse-glow"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center gap-2">
                  🔗 CONNECTING <ComicLoader />
                </span>
              ) : (
                '🦄 CONNECT METAMASK!'
              )}
            </button>
        
            {error && (
              <div className="mt-4 p-4 bg-red-100 border-4 border-red-500 rounded-2xl text-red-700 font-bold transform -skew-x-3 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] animate-shake">
                💥 OOPS! {error}
              </div>
            )}        <div className="mt-6 text-center">
          <div className="inline-block bg-purple-200 px-4 py-2 rounded-xl border-2 border-purple-700 transform skew-x-6">
            <span className="text-purple-800 font-bold text-sm">🚀 Ready to chat? Connect now!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chat interface component
function ChatWindow() {
  const { user } = useWallet()
  const { messages, sendMessage, isSending } = useMessages()
  const { balance, refreshBalance } = useWalletBalance(user?.address)
  const { deposit, withdraw, isDepositing, isWithdrawing, error: walletError, clearError } = useWalletOperations()
  const [selectedContact, setSelectedContact] = useState<string>('')
  const [newContact, setNewContact] = useState('')
  const [messageText, setMessageText] = useState('')
  const [showWallet, setShowWallet] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Group messages by contact
  const conversations = messages.reduce((acc: any, message: any) => {
    const contact = message.from === user?.address ? message.to : message.from
    if (!acc[contact]) {
      acc[contact] = []
    }
    acc[contact].push(message)
    return acc
  }, {})

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedContact) return

    try {
      await sendMessage({ to: selectedContact, content: messageText.trim() })
      setMessageText('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleAddContact = () => {
    if (newContact.trim() && !conversations[newContact.trim()]) {
      setSelectedContact(newContact.trim())
      setNewContact('')
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex relative">
      <DotPattern className="opacity-20" width={24} height={24} />
      
      {/* Sidebar */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r-4 border-black shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col relative z-10">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-yellow-300 to-orange-400 border-b-4 border-black flex items-center justify-between">
          <ComicText fontSize={1.2} className="text-black">
            ZEPHEX
          </ComicText>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWallet(!showWallet)}
              className={`px-3 py-1 text-sm font-bold rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all ${
                showWallet ? 'bg-green-300 text-green-800' : 'bg-blue-200 text-blue-800'
              }`}
            >
              💰 WALLET
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('wallet_connected')
                window.location.reload()
              }}
              className="px-3 py-1 text-sm font-bold bg-red-300 text-red-800 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
            >
              🚪 EXIT
            </button>
          </div>
        </div>

        {/* Wallet Panel */}
        {showWallet && (
          <div className="p-4 bg-gradient-to-r from-green-200 to-emerald-300 border-b-4 border-black">
            <div className="text-sm font-bold text-gray-800 mb-3 bg-white/70 px-3 py-2 rounded-lg border-2 border-black transform -skew-x-3">
              💳 Balance: {balance.formatted} ETH
            </div>
            
            {walletError && (
              <div className="mb-3 p-3 bg-red-200 border-2 border-red-600 rounded-lg text-red-800 text-xs font-bold transform skew-x-3 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
                💥 ERROR: {walletError}
                <button onClick={clearError} className="ml-2 bg-red-600 text-white px-2 py-1 rounded">✕</button>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border-2 border-black rounded-lg bg-white/90 font-bold focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <button 
                  className="px-4 py-2 text-sm bg-green-400 text-green-900 rounded-lg border-2 border-black font-bold hover:bg-green-500 disabled:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
                  disabled={isDepositing || !depositAmount}
                  onClick={async () => {
                    try {
                      await deposit(depositAmount)
                      setDepositAmount('')
                      refreshBalance()
                    } catch (error) {
                      console.error('Deposit failed:', error)
                    }
                  }}
                >
                  {isDepositing ? (
                    <span className="flex items-center gap-1">
                      💸 <ComicLoader />
                    </span>
                  ) : (
                    '💰 DEPOSIT!'
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border-2 border-black rounded-lg bg-white/90 font-bold focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
                <button 
                  className="px-4 py-2 text-sm bg-red-400 text-red-900 rounded-lg border-2 border-black font-bold hover:bg-red-500 disabled:bg-gray-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
                  disabled={isWithdrawing || !withdrawAmount}
                  onClick={async () => {
                    try {
                      await withdraw(withdrawAmount)
                      setWithdrawAmount('')
                      refreshBalance()
                    } catch (error) {
                      console.error('Withdrawal failed:', error)
                    }
                  }}
                >
                  {isWithdrawing ? (
                    <span className="flex items-center gap-1">
                      🔄 <ComicLoader />
                    </span>
                  ) : (
                    '🏦 WITHDRAW!'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contact */}
        <div className="p-4 border-b-2 border-black bg-purple-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm font-bold bg-white/90 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] placeholder-gray-500"
            />
            <button
              onClick={handleAddContact}
              className="px-4 py-2 bg-purple-400 text-purple-900 rounded-lg text-sm font-bold hover:bg-purple-500 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
            >
              ➕ ADD!
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto bg-white/50">
          {Object.keys(conversations).length === 0 ? (
            <div className="p-6 text-center">
              <div className="bg-yellow-200 border-2 border-black rounded-xl p-4 transform -skew-x-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-yellow-800 font-bold text-sm">
                  💭 No conversations yet!
                </div>
                <div className="text-yellow-700 text-xs mt-1">
                  Add a contact to start chatting! 🚀
                </div>
              </div>
            </div>
          ) : (
            Object.keys(conversations).map((contact) => {
              const lastMessage = conversations[contact][conversations[contact].length - 1]
              return (
                <div
                  key={contact}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b-2 border-gray-300 cursor-pointer hover:bg-gradient-to-r hover:from-pink-100 hover:to-purple-100 transition-all transform hover:scale-105 ${
                    selectedContact === contact ? 'bg-gradient-to-r from-blue-200 to-cyan-200 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="font-bold text-sm text-gray-900 bg-white/70 px-2 py-1 rounded border border-black inline-block">
                    👤 {contact.slice(0, 6)}...{contact.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 font-medium bg-gray-100/50 px-2 py-1 rounded border border-gray-400 truncate">
                    💬 {lastMessage?.content || 'No messages yet'}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t-4 border-black bg-gradient-to-r from-indigo-200 to-pink-200">
          <div className="bg-white/80 p-3 rounded-xl border-2 border-black transform skew-x-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-xs font-bold text-indigo-700">🎮 PLAYER:</div>
            <div className="text-sm font-mono font-bold text-indigo-900">
              {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm relative z-10">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-300 to-blue-400 border-b-4 border-black">
              <div className="bg-white/90 p-3 rounded-xl border-2 border-black transform -skew-x-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-bold text-gray-900 text-lg">
                  🎯 CHATTING WITH: {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  📊 {conversations[selectedContact]?.length || 0} messages sent!
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/90 to-blue-50/90">
              {conversations[selectedContact]?.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.from === user?.address ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform message-bubble hover-lift ${
                      message.from === user?.address
                        ? 'bg-gradient-to-r from-green-300 to-blue-400 text-black skew-x-3'
                        : 'bg-gradient-to-r from-pink-300 to-purple-400 text-black -skew-x-3'
                    } transition-transform duration-200`}
                  >
                    <div className="text-sm font-bold">{message.content}</div>
                    <div className={`text-xs mt-1 font-medium ${
                      message.from === user?.address ? 'text-green-800' : 'text-purple-800'
                    }`}>
                      ⏰ {new Date(message.timestamp * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gradient-to-r from-yellow-200 to-orange-300 border-t-4 border-black">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your epic message here! 💭"
                  className="flex-1 px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold bg-white/90 placeholder-gray-600 text-black"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-400 hover:from-red-500 hover:to-pink-600 border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-0.5 transition-all"
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      🚀 SENDING <ComicLoader />
                    </span>
                  ) : (
                    '💥 SEND!'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="bg-white/90 p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-transform">
              <ComicText fontSize={1.5} className="mb-4">
                WELCOME TO ZEPHEX!
              </ComicText>
              <div className="bg-gradient-to-r from-purple-200 to-pink-200 p-4 rounded-xl border-2 border-black transform -skew-x-6">
                <div className="text-lg font-bold text-purple-800 mb-2">🎮 Ready to Chat?</div>
                <div className="text-sm font-medium text-purple-700">
                  Select a conversation or add a new contact to start your epic messaging adventure! 🚀
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AppContent() {
  const { user } = useWallet()

  if (!user?.isConnected) {
    return <WalletConnect />
  }

  return <ChatWindow />
}

function App() {
  return (
    <WalletProvider>
      <MessageProvider>
        <AppContent />
      </MessageProvider>
    </WalletProvider>
  )
}

export default App
