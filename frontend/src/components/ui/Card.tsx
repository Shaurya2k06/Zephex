import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'glow'
  glowColor?: 'purple' | 'blue' | 'pink' | 'green'
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  glowColor = 'purple'
}: CardProps) {
  const variantClasses = {
    default: "bg-slate-800/50 border-slate-700/50 backdrop-blur-sm",
    glass: "bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl",
    gradient: "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 backdrop-blur-sm",
    glow: cn(
      "bg-slate-800/30 border backdrop-blur-xl shadow-2xl",
      glowColor === 'purple' && "border-purple-500/30 shadow-purple-500/25",
      glowColor === 'blue' && "border-blue-500/30 shadow-blue-500/25",
      glowColor === 'pink' && "border-pink-500/30 shadow-pink-500/25",
      glowColor === 'green' && "border-green-500/30 shadow-green-500/25"
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 hover:shadow-lg",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b border-white/10", className)}>
      {children}
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  gradient?: boolean
}

export function CardTitle({ children, className, gradient = false }: CardTitleProps) {
  return (
    <h3 
      className={cn(
        "text-lg font-semibold",
        gradient 
          ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          : "text-white",
        className
      )}
    >
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-400 mt-1", className)}>
      {children}
    </p>
  )
}
