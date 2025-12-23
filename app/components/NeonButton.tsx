"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface NeonButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  type?: "button" | "submit";
}

export const NeonButton = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: NeonButtonProps) => {
  const variants = {
    primary:
      "bg-primary text-primary-foreground glow-violet hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)]",
    secondary:
      "bg-secondary text-secondary-foreground glow-cyan hover:shadow-[0_0_30px_hsl(var(--secondary)/0.7)]",
    outline: "bg-transparent border-glow text-foreground hover:bg-primary/10",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
