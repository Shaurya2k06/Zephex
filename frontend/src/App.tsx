import { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { MessageProvider, useMessages } from './contexts/MessageContext'
import './App.css'

// Simple wallet connection component
function WalletConnect() {
  const { connectWallet, isConnecting, error } = useWallet()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Zephex - Secure Messaging
        </h1>
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <p className="mt-4 text-gray-600 text-sm text-center">
          Connect your MetaMask wallet to start using Zephex on Sepolia testnet
        </p>
      </div>
    </div>
  )
}

// Simple navigation
function Navigation({ currentPage, onPageChange }: { 
  currentPage: string; 
  onPageChange: (page: 'dashboard' | 'messages' | 'settings') => void 
}) {
  const { user, disconnectWallet } = useWallet()
  
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-gray-900">Zephex</h1>
          
          <div className="flex space-x-4">
            {['dashboard', 'messages', 'settings'].map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page as any)}
                className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                  currentPage === page
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}
          </span>
          <button
            onClick={disconnectWallet}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Disconnect
          </button>
        </div>
      </div>
    </nav>
  )
}

// Simple dashboard
function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome to Zephex secure messaging platform!</p>
      </div>
    </div>
  )
}

// Simple messages page
function Messages() {
  const { messages, sendMessage, isSending } = useMessages()
  const [to, setTo] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!to.trim() || !content.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      await sendMessage({ to: to.trim(), content: content.trim() })
      setTo('')
      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                placeholder="Type your message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !to.trim() || !content.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Messages ({messages.length})
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            ) : (
              messages.map((message: any) => (
                <div key={message.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      From: {message.from.slice(0, 6)}...{message.from.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {message.isDecrypted ? message.content : 'Encrypted message'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple settings page
function Settings() {
  const { user } = useWallet()
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
            <p className="mt-1 text-sm text-gray-600 font-mono">{user?.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <p className="mt-1 text-sm text-green-600">Connected</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user } = useWallet()
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'messages' | 'settings'>('dashboard')

  if (!user?.isConnected) {
    return <WalletConnect />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'messages':
        return <Messages />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderPage()}
      </main>
    </div>
  )
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
