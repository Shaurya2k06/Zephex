import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'gradient' | 'glow'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  glowColor?: 'purple' | 'blue' | 'pink' | 'green'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  glowColor = 'purple',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    default: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 focus:ring-slate-500",
    primary: "bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 focus:ring-purple-500 shadow-lg shadow-purple-500/25",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 focus:ring-slate-500",
    ghost: "hover:bg-white/10 text-gray-300 hover:text-white focus:ring-slate-500",
    outline: "border border-white/20 text-white hover:bg-white/10 focus:ring-slate-500",
    gradient: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 focus:ring-purple-500 shadow-lg shadow-purple-500/30",
    glow: cn(
      "text-white border backdrop-blur-sm hover:shadow-2xl transition-all duration-300",
      glowColor === 'purple' && "bg-purple-600/20 border-purple-500/50 hover:bg-purple-600/30 hover:border-purple-400 hover:shadow-purple-500/40 focus:ring-purple-500",
      glowColor === 'blue' && "bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30 hover:border-blue-400 hover:shadow-blue-500/40 focus:ring-blue-500",
      glowColor === 'pink' && "bg-pink-600/20 border-pink-500/50 hover:bg-pink-600/30 hover:border-pink-400 hover:shadow-pink-500/40 focus:ring-pink-500",
      glowColor === 'green' && "bg-green-600/20 border-green-500/50 hover:bg-green-600/30 hover:border-green-400 hover:shadow-green-500/40 focus:ring-green-500"
    )
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  )
}

export default Button
