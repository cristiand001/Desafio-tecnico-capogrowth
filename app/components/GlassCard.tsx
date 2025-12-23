"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  delay?: number;
  onClick?: () => void;
}

export const GlassCard = ({
  children,
  className = "",
  glow = false,
  delay = 0,
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-strong rounded-2xl p-6 ${
        glow ? "border-glow" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
