import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { DotPattern } from '../magicui/dot-pattern'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
  currentPage: 'dashboard' | 'messages' | 'settings'
  onPageChange: (page: 'dashboard' | 'messages' | 'settings') => void
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background with DotPattern */}
      <div className="absolute inset-0 overflow-hidden">
        <DotPattern
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
          glow={true}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "opacity-30"
          )}
        />
        
        {/* Additional gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-transparent to-slate-900/30" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {/* Glass morphism effect container */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10" />
              <div className="relative z-10 p-8">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
