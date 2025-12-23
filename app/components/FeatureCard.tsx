"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
  gradient: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  gradient,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -8,
        rotateX: 5,
        rotateY: 5,
        transition: { duration: 0.3 },
      }}
      className="group relative text-center p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* 3D hover effect background */}
      <motion.div
        className={`absolute inset-0 ${gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        style={{
          transform: "translateZ(-50px)",
        }}
      />

      {/* Icon container with 3D effect */}
      <motion.div
        className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
        whileHover={{
          rotateY: 15,
          rotateX: 15,
          scale: 1.1,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          style={{
            transform: "translateZ(20px)",
          }}
        >
          {icon}
        </motion.div>
      </motion.div>

      <h3 className="font-bold text-slate-800 mb-3 text-lg">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
        initial={{ x: "-100%", y: "-100%" }}
        whileHover={{ x: "100%", y: "100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}

