"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";

export default function Portal() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-120, 120], [18, -18]);
  const rotateY = useTransform(mouseX, [-120, 120], [-18, 18]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY }}
      className="relative mx-auto mb-8 flex h-96 w-96 items-center justify-center [transform-style:preserve-3d]"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute h-96 w-96 rounded-full border border-cyan-300/70 shadow-[0_0_100px_#00f5ff]"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        className="absolute h-80 w-80 rounded-full border-4 border-purple-500/40 shadow-[0_0_130px_#7c3aed]"
      />

      <motion.div
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-64 w-64 rounded-full border border-cyan-200/40 bg-cyan-400/10 blur-[1px]"
      />

      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-44 w-44 rounded-full bg-black shadow-[inset_0_0_70px_#00f5ff,0_0_100px_#00f5ff]"
      />

      <motion.div
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl"
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute h-[420px] w-[420px] rounded-full border-t border-cyan-200/80"
      />
    </motion.div>
  );
}