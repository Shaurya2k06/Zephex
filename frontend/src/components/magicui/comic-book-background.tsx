"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ComicElement {
  id: number;
  type: "bubble" | "ray" | "dot" | "star" | "burst";
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  duration: number;
}

export function ComicBookBackground() {
  const [elements, setElements] = useState<ComicElement[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(147, 51, 234, 0.08)", // purple
      "rgba(236, 72, 153, 0.08)", // pink
      "rgba(234, 179, 8, 0.08)",  // yellow
      "rgba(6, 182, 212, 0.08)",  // cyan
      "rgba(16, 185, 129, 0.08)", // emerald
    ];

    const types: ComicElement["type"][] = ["bubble", "ray", "dot", "star", "burst"];
    
    const initialElements: ComicElement[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      duration: Math.random() * 15 + 10,
    }));

    setElements(initialElements);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50" />
      
      {/* Comic halftone pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.4) 1px, transparent 0),
            radial-gradient(circle at 11px 11px, rgba(236, 72, 153, 0.3) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px, 30px 30px'
        }}
      />

      {/* Animated comic rays */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gradient-to-r from-transparent via-yellow-200/10 to-transparent"
            style={{
              width: "150%",
              height: "3px",
              top: "50%",
              left: "-25%",
              transformOrigin: "center",
              transform: `rotate(${i * 30}deg)`,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              scaleY: [1, 1.5, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* Comic book elements */}
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
            rotate: [element.rotation, element.rotation + 360],
            x: [0, Math.sin(element.id) * 50, 0],
            y: [0, Math.cos(element.id) * 30, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.id * 0.5,
          }}
        >
          {element.type === "bubble" && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={element.color.replace("0.08", "0.2")}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <circle cx="50" cy="50" r="20" fill={element.color} />
            </svg>
          )}
          
          {element.type === "star" && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,0 61,35 96,35 68,57 79,91 50,70 21,91 32,57 4,35 39,35"
                fill={element.color}
                stroke={element.color.replace("0.08", "0.3")}
                strokeWidth="2"
              />
            </svg>
          )}

          {element.type === "burst" && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[...Array(8)].map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos((i * Math.PI) / 4)}
                  y2={50 + 40 * Math.sin((i * Math.PI) / 4)}
                  stroke={element.color.replace("0.08", "0.4")}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="50" cy="50" r="8" fill={element.color.replace("0.08", "0.6")} />
            </svg>
          )}

          {element.type === "dot" && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="30" fill={element.color} opacity="0.4" />
              <circle cx="50" cy="50" r="15" fill={element.color.replace("0.08", "0.6")} />
              <circle cx="50" cy="50" r="5" fill="white" opacity="0.8" />
            </svg>
          )}

          {element.type === "ray" && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M20,50 L80,30 L60,50 L80,70 Z"
                fill={element.color.replace("0.08", "0.3")}
                stroke={element.color.replace("0.08", "0.5")}
                strokeWidth="1"
              />
            </svg>
          )}
        </motion.div>
      ))}

      {/* Comic book speech bubble trails */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            width: "60px",
            height: "40px",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 0.4, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 3,
          }}
        >
          <svg viewBox="0 0 60 40" className="w-full h-full">
            <ellipse
              cx="30"
              cy="20"
              rx="25"
              ry="15"
              fill="rgba(255, 255, 255, 0.1)"
              stroke="rgba(147, 51, 234, 0.2)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <circle cx="15" cy="35" r="3" fill="rgba(147, 51, 234, 0.1)" />
            <circle cx="8" cy="38" r="2" fill="rgba(147, 51, 234, 0.1)" />
          </svg>
        </motion.div>
      ))}

      {/* Animated comic book action lines */}
      <motion.div
        className="absolute inset-0"
        animate={{ 
          x: [0, 50, 0],
          opacity: [0.1, 0.3, 0.1] 
        }}
        transition={{ duration: 20, repeat: Infinity }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute bg-gradient-to-r from-transparent via-purple-200/20 to-transparent"
            style={{
              width: "200px",
              height: "1px",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 180}deg)`,
            }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Floating comic sound effects */}
      <motion.div
        className="absolute top-1/4 right-1/4 text-6xl font-bold text-purple-200/20 transform -rotate-12"
        animate={{
          scale: [0.8, 1.2, 0.8],
          rotate: [-12, -8, -12],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        POW!
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/4 text-4xl font-bold text-pink-200/20 transform rotate-12"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [12, 16, 12],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 3 }}
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        ZAP!
      </motion.div>

      <motion.div
        className="absolute top-2/3 right-1/3 text-5xl font-bold text-yellow-200/20 transform -rotate-6"
        animate={{
          scale: [0.9, 1.1, 0.9],
          rotate: [-6, -2, -6],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 5 }}
        style={{ fontFamily: "'Bangers', cursive" }}
      >
        BOOM!
      </motion.div>
    </div>
  );
}
