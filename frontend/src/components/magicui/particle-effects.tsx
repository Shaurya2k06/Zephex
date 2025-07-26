"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ParticleExplosionProps {
  trigger: boolean;
  center: { x: number; y: number };
  colors?: string[];
  particleCount?: number;
}

interface Particle {
  id: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
  life: number;
}

export function ParticleExplosion({
  trigger,
  center,
  colors = ["#FFD700", "#FF69B4", "#00CED1", "#FF6347", "#32CD32"],
  particleCount = 15,
}: ParticleExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsExploding(true);
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        angle: (i * 360) / particleCount,
        velocity: 100 + Math.random() * 100,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1 + Math.random() * 2,
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => {
        setIsExploding(false);
        setParticles([]);
      }, 3000);
    }
  }, [trigger, particleCount, colors]);

  if (!isExploding || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full border-2 border-black"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: center.x,
            top: center.y,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.velocity,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.velocity,
            opacity: 0,
            scale: 0,
            rotate: 360,
          }}
          transition={{
            duration: particle.life,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Comic-style text burst component
interface TextBurstProps {
  text: string;
  show: boolean;
  position: { x: number; y: number };
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg px-2 py-1",
  md: "text-2xl px-4 py-2",
  lg: "text-4xl px-6 py-3",
};

export function TextBurst({
  text,
  show,
  position,
  color = "bg-red-400",
  size = "md",
}: TextBurstProps) {
  if (!show) return null;

  return (
    <motion.div
      className={`fixed z-50 font-black text-white rounded-full border-4 border-black transform -rotate-12 pointer-events-none ${color} ${sizeClasses[size]}`}
      style={{
        left: position.x,
        top: position.y,
        fontFamily: "'Bangers', 'Comic Sans MS', cursive",
      }}
      initial={{
        scale: 0,
        opacity: 0,
        rotate: -12,
      }}
      animate={{
        scale: [0, 1.3, 1],
        opacity: [0, 1, 1, 0],
        rotate: [-12, -8, -12],
        y: [0, -20, -40],
      }}
      transition={{
        duration: 2,
        times: [0, 0.3, 0.7, 1],
        ease: "easeOut",
      }}
    >
      {text}
    </motion.div>
  );
}

// Comic speech bubble
interface SpeechBubbleProps {
  text: string;
  show: boolean;
  position: { x: number; y: number };
  type?: "speech" | "thought" | "shout";
}

export function SpeechBubble({
  text,
  show,
  position,
  type = "speech",
}: SpeechBubbleProps) {
  if (!show) return null;

  const bubbleStyles = {
    speech: "bg-white border-4 border-black rounded-3xl",
    thought: "bg-blue-100 border-4 border-blue-600 rounded-full",
    shout: "bg-red-200 border-4 border-red-600 transform rotate-3",
  };

  return (
    <motion.div
      className={`fixed z-50 p-4 max-w-xs pointer-events-none ${bubbleStyles[type]}`}
      style={{
        left: position.x,
        top: position.y,
        fontFamily: "'Comic Sans MS', cursive",
      }}
      initial={{
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        bounce: 0.8,
      }}
    >
      <div className="text-black font-bold text-sm">{text}</div>
      
      {/* Speech bubble tail */}
      <div className="absolute bottom-0 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black transform translate-y-full" />
      <div className="absolute bottom-0 left-8 w-0 h-0 border-l-6 border-r-6 border-t-6 border-l-transparent border-r-transparent border-t-white transform translate-y-full translate-x-1" />
    </motion.div>
  );
}
