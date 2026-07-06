"use client";

import { motion } from "framer-motion";

export default function Portal() {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "linear",
      }}
      className="w-80 h-80 rounded-full border-4 border-cyan-400 shadow-[0_0_80px_#00ffff]"
    />
  );
}