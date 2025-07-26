"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface MeshGradientProps {
  className?: string;
  variant?: "subtle" | "warm" | "cool" | "cosmic";
}

const gradientVariants = {
  subtle: {
    base: "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100",
    overlay1: "from-blue-50/50 via-purple-50/30 to-pink-50/50",
    overlay2: "from-emerald-50/40 via-yellow-50/30 to-orange-50/40",
  },
  warm: {
    base: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
    overlay1: "from-red-50/40 via-pink-50/30 to-purple-50/40",
    overlay2: "from-yellow-50/50 via-orange-50/40 to-red-50/30",
  },
  cool: {
    base: "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50",
    overlay1: "from-indigo-50/40 via-blue-50/30 to-cyan-50/40",
    overlay2: "from-teal-50/50 via-emerald-50/40 to-green-50/30",
  },
  cosmic: {
    base: "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
    overlay1: "from-violet-50/40 via-purple-50/30 to-fuchsia-50/40",
    overlay2: "from-blue-50/50 via-indigo-50/40 to-violet-50/30",
  },
};

export function MeshGradient({ className, variant = "cosmic" }: MeshGradientProps) {
  const colors = gradientVariants[variant];

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Base gradient */}
      <div className={cn("absolute inset-0", colors.base)} />
      
      {/* Animated mesh overlay 1 */}
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-br opacity-60", colors.overlay1)}
        animate={{
          background: [
            `linear-gradient(45deg, ${colors.overlay1.split(' ')[0].replace('from-', 'rgba(')}, ${colors.overlay1.split(' ')[2].replace('to-', 'rgba(')})`,
            `linear-gradient(135deg, ${colors.overlay1.split(' ')[2].replace('to-', 'rgba(')}, ${colors.overlay1.split(' ')[0].replace('from-', 'rgba(')})`,
            `linear-gradient(225deg, ${colors.overlay1.split(' ')[1].replace('via-', 'rgba(')}, ${colors.overlay1.split(' ')[2].replace('to-', 'rgba(')})`,
            `linear-gradient(315deg, ${colors.overlay1.split(' ')[0].replace('from-', 'rgba(')}, ${colors.overlay1.split(' ')[1].replace('via-', 'rgba(')})`,
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Animated mesh overlay 2 */}
      <motion.div
        className={cn("absolute inset-0 bg-gradient-to-br opacity-40", colors.overlay2)}
        animate={{
          background: [
            `linear-gradient(90deg, ${colors.overlay2.split(' ')[0].replace('from-', 'rgba(')}, ${colors.overlay2.split(' ')[2].replace('to-', 'rgba(')})`,
            `linear-gradient(180deg, ${colors.overlay2.split(' ')[2].replace('to-', 'rgba(')}, ${colors.overlay2.split(' ')[0].replace('from-', 'rgba(')})`,
            `linear-gradient(270deg, ${colors.overlay2.split(' ')[1].replace('via-', 'rgba(')}, ${colors.overlay2.split(' ')[2].replace('to-', 'rgba(')})`,
            `linear-gradient(0deg, ${colors.overlay2.split(' ')[0].replace('from-', 'rgba(')}, ${colors.overlay2.split(' ')[1].replace('via-', 'rgba(')})`,
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating light spots */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5 blur-2xl"
          style={{
            width: `${100 + Math.random() * 200}px`,
            height: `${100 + Math.random() * 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}
