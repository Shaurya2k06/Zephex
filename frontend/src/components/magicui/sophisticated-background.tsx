"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
}

export function SophisticatedBackground() {
  const [orbs, setOrbs] = useState<FloatingOrb[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(139, 69, 19, 0.1)", // Subtle brown
      "rgba(75, 85, 99, 0.1)",  // Cool gray
      "rgba(156, 163, 175, 0.1)", // Light gray
      "rgba(239, 68, 68, 0.08)",  // Soft red
      "rgba(59, 130, 246, 0.08)", // Soft blue
      "rgba(16, 185, 129, 0.08)", // Soft green
      "rgba(245, 158, 11, 0.08)", // Soft amber
      "rgba(139, 92, 246, 0.08)", // Soft purple
    ];
    
    const initialOrbs: FloatingOrb[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 300 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.3 + 0.1,
      duration: Math.random() * 20 + 15,
    }));

    setOrbs(initialOrbs);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background - much more subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200" />
      
      {/* Subtle animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-50"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05), rgba(234, 179, 8, 0.05))",
            "linear-gradient(90deg, rgba(236, 72, 153, 0.05), rgba(234, 179, 8, 0.05), rgba(6, 182, 212, 0.05))",
            "linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05))",
            "linear-gradient(180deg, rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))",
            "linear-gradient(225deg, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05), rgba(234, 179, 8, 0.05))",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Floating orbs - much more subtle */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-xl"
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            opacity: orb.opacity,
          }}
          initial={{
            x: `${orb.x}%`,
            y: `${orb.y}%`,
          }}
          animate={{
            x: [`${orb.x}%`, `${(orb.x + 20) % 100}%`, `${orb.x}%`],
            y: [`${orb.y}%`, `${(orb.y + 15) % 100}%`, `${orb.y}%`],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Subtle geometric shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-gray-200/30"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border border-gray-300/20"
        animate={{
          scale: [1, 0.9, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Soft light rays */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-transparent via-gray-400/20 to-transparent"
            style={{
              width: "200%",
              height: "2px",
              top: "50%",
              left: "-50%",
              transformOrigin: "center",
              transform: `rotate(${i * 60}deg)`,
            }}
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.3,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
