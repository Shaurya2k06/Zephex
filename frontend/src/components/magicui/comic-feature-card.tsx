"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ComicFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "blue" | "green" | "purple" | "orange" | "pink";
  delay?: number;
}

const colorClasses = {
  blue: {
    bg: "bg-gradient-to-b from-blue-200 to-cyan-300",
    title: "text-blue-900",
    desc: "text-blue-800",
    shadow: "shadow-blue-600/50",
  },
  green: {
    bg: "bg-gradient-to-b from-green-200 to-emerald-300",
    title: "text-green-900",
    desc: "text-green-800",
    shadow: "shadow-green-600/50",
  },
  purple: {
    bg: "bg-gradient-to-b from-purple-200 to-pink-300",
    title: "text-purple-900",
    desc: "text-purple-800",
    shadow: "shadow-purple-600/50",
  },
  orange: {
    bg: "bg-gradient-to-b from-orange-200 to-yellow-300",
    title: "text-orange-900",
    desc: "text-orange-800",
    shadow: "shadow-orange-600/50",
  },
  pink: {
    bg: "bg-gradient-to-b from-pink-200 to-rose-300",
    title: "text-pink-900",
    desc: "text-pink-800",
    shadow: "shadow-pink-600/50",
  },
};

export function ComicFeatureCard({
  icon,
  title,
  description,
  color,
  delay = 0,
}: ComicFeatureCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer overflow-hidden",
        colors.bg,
        colors.shadow
      )}
      initial={{ opacity: 0, y: 50, rotate: -5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: delay + 0.8 }}
      whileHover={{
        rotate: [0, -3, 3, 0],
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Comic burst background */}
      <motion.div
        className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full border-3 border-black opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Lightning bolt decorations */}
      <motion.div
        className="absolute top-2 right-2 text-yellow-500 opacity-60"
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay,
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C15.39 14.25 13.65 17.6 11 21z"/>
        </svg>
      </motion.div>

      {/* Icon container with animation */}
      <motion.div
        className="text-5xl mb-4 flex justify-center"
        whileHover={{
          scale: 1.3,
          rotate: [0, -10, 10, 0],
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: delay * 0.5,
          }}
        >
          {icon}
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div 
        className={cn("font-bold text-lg mb-3 text-center", colors.title)}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: delay + 1 }}
      >
        {title}
      </motion.div>

      {/* Description */}
      <motion.div 
        className={cn("font-medium text-sm text-center", colors.desc)}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: delay + 1.2 }}
      >
        {description}
      </motion.div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Comic "POW!" style burst on hover */}
      <motion.div
        className="absolute -top-2 -left-2 bg-red-400 text-white text-xs font-bold py-1 px-2 rounded-full border-2 border-black transform -rotate-12 opacity-0"
        whileHover={{ opacity: 1, scale: [0, 1.2, 1] }}
        transition={{ duration: 0.3 }}
      >
        POW!
      </motion.div>
    </motion.div>
  );
}
