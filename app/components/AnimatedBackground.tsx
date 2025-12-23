"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
    </div>
  );
}

