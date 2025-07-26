"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ZephexLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  animated?: boolean;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  border?: boolean;
  shadow?: boolean;
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8", 
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
  "2xl": "w-24 h-24",
};

const roundedClasses = {
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl", 
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
  "3xl": "rounded-full",
};

export function ZephexLogo({ 
  size = "md", 
  animated = false,
  className,
  rounded = "xl",
  border = true,
  shadow = true
}: ZephexLogoProps) {
  const baseClasses = cn(
    sizeClasses[size],
    roundedClasses[rounded],
    border && "border-4 border-black",
    shadow && "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    className
  );

  if (animated) {
    return (
      <motion.img
        src="/Zephex.png"
        alt="Zephex Logo"
        className={baseClasses}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.3 }
        }}
      />
    );
  }

  return (
    <img
      src="/Zephex.png"
      alt="Zephex Logo"
      className={cn(baseClasses, "transition-transform duration-300 hover:scale-110")}
    />
  );
}
