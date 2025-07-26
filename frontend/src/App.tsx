import { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { MessageProvider, useMessages } from './contexts/MessageContext'
import { useWalletBalance, useWalletOperations } from './hooks/useWalletBalance'
import './App.css'

// Simple wallet connection component
function WalletConnect() {
  const { connectWallet, isConnecting, error } = useWallet()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-gray-50 p-8 rounded-lg border max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Zephex
        </h1>
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <p className="mt-4 text-gray-600 text-sm text-center">
          Connect your MetaMask wallet to start messaging
        </p>
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
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Zephex</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWallet(!showWallet)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Wallet
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('wallet_connected')
                window.location.reload()
              }}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Wallet Panel */}
        {showWallet && (
          <div className="p-4 bg-blue-50 border-b">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Wallet Balance: {balance.formatted} ETH
            </div>
            
            {walletError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
                {walletError}
                <button onClick={clearError} className="ml-2 underline">✕</button>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <button 
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
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
                  {isDepositing ? 'Depositing...' : 'Deposit'}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <button 
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
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
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contact */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleAddContact}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(conversations).length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet. Add a contact to start messaging.
            </div>
          ) : (
            Object.keys(conversations).map((contact) => {
              const lastMessage = conversations[contact][conversations[contact].length - 1]
              return (
                <div
                  key={contact}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                    selectedContact === contact ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {contact.slice(0, 6)}...{contact.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {lastMessage?.content || 'No messages yet'}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t bg-white">
          <div className="text-xs text-gray-500">Connected as:</div>
          <div className="text-sm font-mono text-gray-900">
            {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b">
              <div className="font-medium text-gray-900">
                {selectedContact.slice(0, 6)}...{selectedContact.slice(-4)}
              </div>
              <div className="text-sm text-gray-500">
                {conversations[selectedContact]?.length || 0} messages
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations[selectedContact]?.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.from === user?.address ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.from === user?.address
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.from === user?.address ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-700"
                >
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Welcome to Zephex</h3>
              <p className="text-sm">Select a conversation or add a new contact to start messaging</p>
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
