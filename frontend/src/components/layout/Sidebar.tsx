import { MessageSquare, BarChart3, Settings, Wallet } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useWallet } from '../../contexts/WalletContext'

interface SidebarProps {
  currentPage: 'dashboard' | 'messages' | 'settings'
  onPageChange: (page: 'dashboard' | 'messages' | 'settings') => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user } = useWallet()

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'messages' as const,
      label: 'Messages',
      icon: MessageSquare,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Zephex
              </h1>
              <p className="text-xs text-gray-400">Encrypted Messaging</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "hover:bg-white/10 hover:backdrop-blur-sm",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white shadow-lg shadow-purple-500/25"
                    : "text-gray-300 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Not Connected'}
              </p>
              <p className="text-xs text-gray-400">
                Connected Wallet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
