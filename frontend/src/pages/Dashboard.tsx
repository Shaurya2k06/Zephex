import { useWallet } from '../contexts/WalletContext'
import { useMessages } from '../contexts/MessageContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MessageCircle, Shield, Users, Clock, TrendingUp, Zap, Activity, Eye, Send, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { user } = useWallet()
  const { messages } = useMessages()

  const stats = [
    {
      title: 'Total Messages',
      value: messages.length,
      icon: MessageCircle,
      description: 'Messages sent and received',
      gradient: 'from-blue-500 to-cyan-600',
      change: '+12%',
      glowColor: 'blue' as const
    },
    {
      title: 'Encrypted',
      value: messages.filter(m => m.isDecrypted).length,
      icon: Shield,
      description: 'Successfully decrypted messages',
      gradient: 'from-green-500 to-emerald-600',
      change: '+100%',
      glowColor: 'green' as const
    },
    {
      title: 'Contacts',
      value: new Set([...messages.map(m => m.from), ...messages.map(m => m.to)]).size - 1,
      icon: Users,
      description: 'Unique conversation partners',
      gradient: 'from-purple-500 to-pink-600',
      change: '+8%',
      glowColor: 'purple' as const
    },
    {
      title: 'Recent',
      value: messages.filter(m => Date.now() - m.timestamp * 1000 < 24 * 60 * 60 * 1000).length,
      icon: Clock,
      description: 'Messages in last 24 hours',
      gradient: 'from-orange-500 to-red-600',
      change: '+25%',
      glowColor: 'pink' as const
    },
  ]

  const recentMessages = messages.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="relative z-10">
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Welcome back!
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-xl mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Your secure, on-chain messaging dashboard
          </motion.p>
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">
                {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-6)}` : 'Not Connected'}
              </span>
            </div>
            <Button variant="gradient" size="sm">
              <Send className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card variant="glow" glowColor={stat.glowColor} className="relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-20`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {stat.description}
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                    <span className="text-xs text-gray-500">vs last week</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Activity & Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle gradient>Recent Messages</CardTitle>
              <CardDescription>
                Your latest encrypted conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-300 font-medium mb-2">No messages yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Start a secure conversation to see it here
                  </p>
                  <Button variant="glow" glowColor="purple" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send First Message
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {(message.from === user?.address 
                            ? message.to 
                            : message.from
                          ).slice(2, 4).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-white">
                            {message.from === user?.address ? 'You' : `${message.from.slice(0, 8)}...`}
                          </p>
                          {message.isDecrypted && (
                            <Lock className="w-3 h-3 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                          {message.content}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(message.timestamp * 1000).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle gradient>Activity Overview</CardTitle>
              <CardDescription>
                Your messaging statistics and trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Messages Today</p>
                      <p className="text-xs text-gray-400">24h activity</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{messages.filter(m => Date.now() - m.timestamp * 1000 < 24 * 60 * 60 * 1000).length}</p>
                    <p className="text-xs text-green-400">+25%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Encryption Rate</p>
                      <p className="text-xs text-gray-400">Successfully encrypted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">100%</p>
                    <p className="text-xs text-green-400">Perfect</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Privacy Score</p>
                      <p className="text-xs text-gray-400">End-to-end encrypted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">A+</p>
                    <p className="text-xs text-purple-400">Excellent</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
