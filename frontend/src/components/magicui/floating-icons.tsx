"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface FloatingIconProps {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "yellow" | "pink" | "blue" | "green" | "purple" | "orange";
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animationDelay?: number;
  animationType?: "bounce" | "float" | "spin" | "pulse";
}

const sizeClasses = {
  sm: "w-10 h-10 text-lg",
  md: "w-14 h-14 text-xl",
  lg: "w-18 h-18 text-2xl",
  xl: "w-24 h-24 text-3xl",
};

const colorClasses = {
  yellow: "bg-yellow-300 border-yellow-600 shadow-yellow-600/50",
  pink: "bg-pink-300 border-pink-600 shadow-pink-600/50",
  blue: "bg-blue-300 border-blue-600 shadow-blue-600/50",
  green: "bg-green-300 border-green-600 shadow-green-600/50",
  purple: "bg-purple-300 border-purple-600 shadow-purple-600/50",
  orange: "bg-orange-300 border-orange-600 shadow-orange-600/50",
};

const getAnimationProps = (type: string) => {
  switch (type) {
    case "bounce":
      return {
        animate: { y: [0, -20, 0] },
        transition: { duration: 2, repeat: Infinity }
      };
    case "float":
      return {
        animate: { y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 5, 0] },
        transition: { duration: 4, repeat: Infinity }
      };
    case "spin":
      return {
        animate: { rotate: [0, 360], scale: [1, 1.1, 1] },
        transition: { duration: 3, repeat: Infinity }
      };
    case "pulse":
      return {
        animate: { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] },
        transition: { duration: 2, repeat: Infinity }
      };
    default:
      return {
        animate: { y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 5, 0] },
        transition: { duration: 4, repeat: Infinity }
      };
  }
};

export function FloatingIcon({
  icon,
  size = "md",
  color = "yellow",
  position,
  animationDelay = 0,
  animationType = "float",
}: FloatingIconProps) {
  const animationProps = getAnimationProps(animationType);
  
  return (
    <motion.div
      className={cn(
        "absolute rounded-full border-4 border-black flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-transform duration-300",
        sizeClasses[size],
        colorClasses[color],
        "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      )}
      style={{
        ...position,
        animationDelay: `${animationDelay}s`,
      }}
      animate={animationProps.animate}
      transition={animationProps.transition}
      whileHover={{
        scale: 1.2,
        rotate: 10,
        transition: { duration: 0.3 },
      }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      {icon}
    </motion.div>
  );
}

// Icon components using SVG instead of emojis
export const ChatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
  </svg>
);

export const PaymentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
  </svg>
);

export const Web3Icon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export const RocketIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.44 5.58s2.12.21 4.3-.02L9.19 6.35zM11.9 17s-3.29-1.4-5.58-3.44L11.9 17z"/>
    <path d="M14.94 2.26l-1.42 1.42C14.73 5.57 15.46 7.5 15.46 7.5s1.93.73 3.82 1.94l1.42-1.42S18.37 4.69 14.94 2.26z"/>
  </svg>
);

export const StarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export const LightningIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C15.39 14.25 13.65 17.6 11 21z"/>
  </svg>
);
