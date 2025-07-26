import { useWallet } from '../contexts/WalletContext'
import { useTheme } from '../contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Settings as SettingsIcon, User, Moon, Sun, LogOut, Shield, Lock, Globe, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Settings() {
  const { user, disconnectWallet } = useWallet()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10">
          <SettingsIcon className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="hover:border-purple-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5 text-purple-400" />
                <span>Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Address
                </label>
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <span className="text-white text-sm font-mono break-all">
                    {user?.address}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection Status
                </label>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Connected</span>
                  <Zap className="h-4 w-4 text-green-400 ml-auto" />
                </div>
              </div>

              <Button
                onClick={disconnectWallet}
                variant="glow"
                className="w-full bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-300 hover:text-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="hover:border-blue-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <SettingsIcon className="h-5 w-5 text-blue-400" />
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <Button
                  onClick={toggleTheme}
                  variant="glow"
                  className="w-full"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Switch to Dark Mode
                    </>
                  )}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Network
                </label>
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Sepolia Testnet</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Encryption
                </label>
                <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">End-to-End Encryption Enabled</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="h-5 w-5 text-amber-400" />
              <span>Security Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm hover:border-blue-400/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Messages are encrypted with your wallet's private key for maximum security
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">On-Chain Storage</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  All messages are stored permanently and immutably on the blockchain
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm hover:border-green-400/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Decentralized</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  No central servers, complete peer-to-peer communication and ownership
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
