import { useState } from 'react'
import { useMessages } from '../contexts/MessageContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { MessageCircle, Send, User, Lock, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Messages() {
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
          <MessageCircle className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Secure Messages
          </h1>
          <p className="text-gray-400">Send and receive encrypted messages on the blockchain</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" className="hover:border-blue-500/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Send className="h-5 w-5 text-blue-400" />
                <span>Send New Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>{error}</span>
                  </motion.div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Address
                  </label>
                  <Input
                    variant="glow"
                    type="text"
                    placeholder="0x..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                    className="transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea
                    variant="glow"
                    placeholder="Type your encrypted message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    required
                    className="resize-none transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  disabled={isSending || !to.trim() || !content.trim()}
                  className="w-full"
                >
                  {isSending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                <span>Recent Messages</span>
                <div className="ml-auto px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                  {messages.length}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No messages yet</h3>
                    <p className="text-gray-500 text-sm">Start a conversation by sending your first encrypted message</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="glow" className="hover:border-blue-500/30 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                                <User className="h-3 w-3 text-blue-400" />
                              </div>
                              <span className="text-sm text-gray-300 font-medium">
                                {message.from.slice(0, 6)}...{message.from.slice(-4)}
                              </span>
                              <Zap className="h-3 w-3 text-gray-500" />
                              <span className="text-sm text-gray-300">
                                {message.to.slice(0, 6)}...{message.to.slice(-4)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
