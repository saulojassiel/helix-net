"use client";

import { motion } from "framer-motion";

export default function Portal() {
  return (
    <div className="relative mx-auto mb-8 flex h-80 w-80 items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute h-80 w-80 rounded-full border border-cyan-300/70 shadow-[0_0_90px_#00f5ff]"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        className="absolute h-64 w-64 rounded-full border-4 border-purple-500/40 shadow-[0_0_120px_#7c3aed]"
      />

      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-44 w-44 rounded-full bg-black shadow-[inset_0_0_60px_#00f5ff,0_0_80px_#00f5ff]"
      />

      <div className="absolute h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
    </div>
  );
}