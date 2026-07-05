"use client";

import { AnimatePresence, motion } from "framer-motion";

export function AnimatedDropdown({
  show,
  children,
  className,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
