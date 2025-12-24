"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
  onClick?: () => void; // Asegúrate de que esté aquí
}

export const GlassCard = ({
  children,
  className = "",
  glow = false,
  delay = 0,
  onClick,
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={`glass-strong rounded-2xl p-6 ${
        glow ? "border-glow" : ""
      } ${className} ${
        onClick ? "cursor-pointer active:scale-95 transition-all" : ""
      }`}
    >
      {children}
    </motion.div>
  );
};
