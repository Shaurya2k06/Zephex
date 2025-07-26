"use client";
import { motion } from "framer-motion";
import { ComicText } from "./magicui/comic-text";
import { DotPattern } from "./magicui/dot-pattern";
import { ComicBookBackground } from "./magicui/comic-book-background";
import { ChatIcon, PaymentIcon, Web3Icon, LightningIcon } from "./magicui/floating-icons";
import { AnimatedButton } from "./magicui/animated-button";

interface LandingScreenProps {
  onGetStarted: () => void;
}

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Comic book background with animated elements */}
      <ComicBookBackground />
      
      {/* Dot pattern overlay */}
      <DotPattern 
        className="opacity-10 z-10" 
        width={30} 
        height={30} 
        glow={true}
      />
      
      {/* Animated comic burst elements in corners */}
      <motion.div
        className="absolute top-4 left-4 w-16 h-16 z-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-full h-full flex items-center justify-center text-2xl font-black">💥</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-4 right-4 w-12 h-12 z-20"
        animate={{
          rotate: [360, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="w-full h-full bg-pink-400 rounded-lg border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-45">
          <div className="w-full h-full flex items-center justify-center text-lg font-black transform -rotate-45">⚡</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-4 w-14 h-14 z-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 15, -15, 0],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="w-full h-full bg-blue-400 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-full h-full flex items-center justify-center text-xl font-black">🚀</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 w-10 h-10 z-20"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <div className="w-full h-full bg-green-400 rounded-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-full h-full flex items-center justify-center text-sm font-black">⭐</div>
        </div>
      </motion.div>

      {/* Main content container - single screen layout */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-20 max-w-5xl mx-auto w-full">
        
        {/* Logo and Title Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-4 flex justify-center">
            <motion.img 
              src="/Zephex.png" 
              alt="Zephex Logo" 
              className="w-20 h-20 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          
          {/* Comic Text for the name */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, type: "spring", bounce: 0.7 }}
          >
            <ComicText fontSize={4} className="mb-2">
              ZEPHEX
            </ComicText>
          </motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white/90 p-4 rounded-2xl border-3 border-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-gray-800 mb-2 transform -skew-x-2">
              EPIC BLOCKCHAIN MESSAGING!
            </h2>
            <p className="text-lg font-bold text-gray-600 transform skew-x-1">
              Chat • Pay • Connect with Web3!
            </p>
          </div>
        </motion.div>

        {/* Features Grid - Compact */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mb-8 w-full max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div 
            className="bg-blue-100 p-3 rounded-xl border-3 border-blue-800 shadow-[3px_3px_0px_0px_rgba(30,64,175,1)] text-center"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl mb-1"><ChatIcon /></div>
            <h3 className="font-black text-sm text-blue-800">SECURE CHAT</h3>
            <p className="text-xs text-blue-600 font-semibold">Blockchain messaging</p>
          </motion.div>
          
          <motion.div 
            className="bg-green-100 p-3 rounded-xl border-3 border-green-800 shadow-[3px_3px_0px_0px_rgba(22,101,52,1)] text-center"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl mb-1"><PaymentIcon /></div>
            <h3 className="font-black text-sm text-green-800">INSTANT PAY</h3>
            <p className="text-xs text-green-600 font-semibold">Send ETH fast</p>
          </motion.div>
          
          <motion.div 
            className="bg-purple-100 p-3 rounded-xl border-3 border-purple-800 shadow-[3px_3px_0px_0px_rgba(107,33,168,1)] text-center"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-2xl mb-1"><Web3Icon /></div>
            <h3 className="font-black text-sm text-purple-800">WEB3 NATIVE</h3>
            <p className="text-xs text-purple-600 font-semibold">Decentralized future</p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.2, type: "spring", bounce: 0.6 }}
        >
          <AnimatedButton onClick={onGetStarted} size="xl" variant="explosive">
            <LightningIcon />
            GET STARTED NOW!
            <LightningIcon />
          </AnimatedButton>
        </motion.div>

        {/* Bottom tagline */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="bg-yellow-100 px-4 py-2 rounded-xl border-2 border-yellow-600 shadow-[2px_2px_0px_0px_rgba(202,138,4,1)]">
            <p className="text-sm font-bold text-yellow-800">
              🔥 Join the Web3 Communication Revolution! 🔥
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
