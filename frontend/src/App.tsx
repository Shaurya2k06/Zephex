import { useState } from 'react'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { MessageProvider } from './contexts/MessageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import { WalletConnect } from './components/wallet/WalletConnect'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Settings from './pages/Settings'
import './App.css'

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
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <ThemeProvider>
        <WalletProvider>
          <MessageProvider>
            <AppContent />
          </MessageProvider>
        </WalletProvider>
      </ThemeProvider>
    </div>
  )
}

export default App
