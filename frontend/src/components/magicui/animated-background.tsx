"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  life: number;
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#32CD32", "#DA70D6"];
    
    const initialParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      life: Math.random() * 100 + 50,
    }));

    setParticles(initialParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400"
        animate={{
          background: [
            "linear-gradient(45deg, #9333ea, #ec4899, #eab308)",
            "linear-gradient(90deg, #ec4899, #eab308, #06b6d4)",
            "linear-gradient(135deg, #eab308, #06b6d4, #9333ea)",
            "linear-gradient(180deg, #06b6d4, #9333ea, #ec4899)",
            "linear-gradient(225deg, #9333ea, #ec4899, #eab308)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            border: "2px solid rgba(0,0,0,0.2)",
          }}
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: [particle.x, particle.x + particle.speedX * 200],
            y: [particle.y, particle.y + particle.speedY * 200],
            rotate: [0, 360],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.life / 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Comic-style rays */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{
              width: "200%",
              height: "4px",
              top: "50%",
              left: "-50%",
              transformOrigin: "center",
              transform: `rotate(${i * 45}deg)`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scaleY: [1, 2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Large decorative shapes */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-400/20 rounded-full border-4 border-black/10"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full border-4 border-black/10"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 0.8, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity }}
      />

      {/* Comic burst shapes */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-32"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <polygon
            points="50,0 61,35 96,35 68,57 79,91 50,70 21,91 32,57 4,35 39,35"
            fill="currentColor"
            className="text-yellow-400"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 w-24 h-24"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
          <polygon
            points="50,0 61,35 96,35 68,57 79,91 50,70 21,91 32,57 4,35 39,35"
            fill="currentColor"
            className="text-pink-400"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>
    </div>
  );
}
