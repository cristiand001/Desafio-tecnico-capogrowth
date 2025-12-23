"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Common animation variants that can be reused across the app
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInUp}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
