"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "explosive";
}

const sizeClasses = {
  sm: "py-2 px-4 text-sm",
  md: "py-4 px-8 text-lg",
  lg: "py-6 px-12 text-2xl",
  xl: "py-8 px-16 text-3xl",
};

const variantClasses = {
  primary: "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-700",
  secondary: "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-700",
  explosive: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600",
};

export function AnimatedButton({
  children,
  onClick,
  className,
  size = "lg",
  variant = "primary",
}: AnimatedButtonProps) {
  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      {/* Explosion particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            variants={{
              hover: {
                x: Math.cos((i * Math.PI) / 4) * 40,
                y: Math.sin((i * Math.PI) / 4) * 40,
                opacity: [0.6, 0],
                scale: [0, 1, 0],
              },
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            whileHover="hover"
            transition={{ duration: 1, delay: i * 0.08 }}
          />
        ))}
      </motion.div>

      <motion.button
        onClick={onClick}
        className={cn(
          "group relative overflow-hidden text-white font-bold transition-all duration-300 border-6 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        whileHover={{
          scale: 1.05,
          y: -4,
          boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
        }}
        whileTap={{
          scale: 0.95,
          y: 0,
          boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
        }}
        animate={{
          boxShadow: [
            "8px 8px 0px 0px rgba(0,0,0,1)",
            "12px 12px 0px 0px rgba(0,0,0,1)",
            "8px 8px 0px 0px rgba(0,0,0,1)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear",
          }}
        />
        
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-indigo-400/30 blur-xl"
          whileHover={{ opacity: 0.4, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.div>
  );
}
