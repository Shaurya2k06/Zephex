import { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { ComicText } from './components/magicui/comic-text'
import { DotPattern } from './components/magicui/dot-pattern'
import { LandingScreen } from './components/LandingScreen'
import { ChatApplication } from './components/ChatApplication'

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
          <div className="mb-4 flex justify-center">
            <img 
              src="/Zephex.png" 
              alt="Zephex Logo" 
              className="w-16 h-16 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce"
            />
          </div>
          <ComicText fontSize={2.5} className="mb-4">
            ZEPHEX!
          </ComicText>
          <div className="text-lg font-bold text-gray-700 transform -skew-x-12 bg-yellow-200 px-4 py-2 rounded-lg border-2 border-black animate-pulse-glow">
             Epic Messaging Platform!
          </div>
        </div>
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-2xl font-bold text-xl transition-all duration-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform hover:-translate-y-1 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover-lift animate-pulse-glow"
        >
          {isConnecting ? (
            <span className="flex items-center justify-center gap-2">
              CONNECTING <ComicLoader />
            </span>
          ) : (
            'CONNECT METAMASK!'
          )}
        </button>
    
        {error && (
          <div className="mt-4 p-4 bg-red-100 border-4 border-red-500 rounded-2xl text-red-700 font-bold transform -skew-x-3 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] animate-shake">
            OOPS! {error}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <div className="inline-block bg-purple-200 px-4 py-2 rounded-xl border-2 border-purple-700 transform skew-x-6">
            <span className="text-purple-800 font-bold text-sm">Ready to chat? Connect now!</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const { user, connectWallet, isConnecting } = useWallet()
  const [showLanding, setShowLanding] = useState(true)

  // Handle get started button - directly connect wallet
  const handleGetStarted = async () => {
    setShowLanding(false)
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // If connection fails, show landing again
      setShowLanding(true)
    }
  }

  // Show landing screen first
  if (showLanding) {
    return <LandingScreen onGetStarted={handleGetStarted} />
  }

  // Show loading while connecting
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 flex items-center justify-center relative overflow-hidden">
        <DotPattern 
          className="opacity-30" 
          width={32} 
          height={32} 
          glow={true}
        />
        
        <div className="bg-white p-8 rounded-3xl border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/Zephex.png" 
              alt="Zephex Logo" 
              className="w-16 h-16 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse"
            />
          </div>
          <ComicText fontSize={2} className="mb-6">
            CONNECTING...
          </ComicText>
          <div className="text-lg font-bold text-gray-700 mb-4">
            Please check MetaMask and approve the connection!
          </div>
          <div className="flex justify-center">
            <ComicLoader />
          </div>
          <button
            onClick={() => setShowLanding(true)}
            className="mt-4 px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg border-2 border-black font-bold hover:bg-gray-400"
          >
            Back to Landing
          </button>
        </div>
      </div>
    )
  }

  // Show chat if connected, otherwise show wallet connect
  if (!user?.isConnected) {
    return <WalletConnect />
  }

  return <ChatApplication />
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}

export default App
