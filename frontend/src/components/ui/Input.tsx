import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  variant?: 'default' | 'glow'
  glowColor?: 'purple' | 'blue' | 'pink' | 'green'
}

export function Input({
  label,
  error,
  variant = 'default',
  glowColor = 'purple',
  className,
  ...props
}: InputProps) {
  const variantClasses = {
    default: "bg-slate-800/50 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20",
    glow: cn(
      "backdrop-blur-sm transition-all duration-300",
      glowColor === 'purple' && "bg-purple-900/10 border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30 focus:shadow-lg focus:shadow-purple-500/25",
      glowColor === 'blue' && "bg-blue-900/10 border-blue-500/30 focus:border-blue-400 focus:ring-blue-500/30 focus:shadow-lg focus:shadow-blue-500/25",
      glowColor === 'pink' && "bg-pink-900/10 border-pink-500/30 focus:border-pink-400 focus:ring-pink-500/30 focus:shadow-lg focus:shadow-pink-500/25",
      glowColor === 'green' && "bg-green-900/10 border-green-500/30 focus:border-green-400 focus:ring-green-500/30 focus:shadow-lg focus:shadow-green-500/25"
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400",
          "focus:outline-none focus:ring-2 transition-all duration-200",
          variantClasses[variant],
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  variant?: 'default' | 'glow'
  glowColor?: 'purple' | 'blue' | 'pink' | 'green'
  rows?: number
}

export function Textarea({
  label,
  error,
  variant = 'default',
  glowColor = 'purple',
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const variantClasses = {
    default: "bg-slate-800/50 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20",
    glow: cn(
      "backdrop-blur-sm transition-all duration-300",
      glowColor === 'purple' && "bg-purple-900/10 border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30 focus:shadow-lg focus:shadow-purple-500/25",
      glowColor === 'blue' && "bg-blue-900/10 border-blue-500/30 focus:border-blue-400 focus:ring-blue-500/30 focus:shadow-lg focus:shadow-blue-500/25",
      glowColor === 'pink' && "bg-pink-900/10 border-pink-500/30 focus:border-pink-400 focus:ring-pink-500/30 focus:shadow-lg focus:shadow-pink-500/25",
      glowColor === 'green' && "bg-green-900/10 border-green-500/30 focus:border-green-400 focus:ring-green-500/30 focus:shadow-lg focus:shadow-green-500/25"
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          "w-full px-4 py-3 rounded-xl border text-white placeholder-gray-400 resize-none",
          "focus:outline-none focus:ring-2 transition-all duration-200",
          variantClasses[variant],
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
