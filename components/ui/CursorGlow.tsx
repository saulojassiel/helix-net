"use client";

import { motion, useMotionValue } from "framer-motion";

export default function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    x.set(event.clientX - 160);
    y.set(event.clientY - 160);
  }

  return (
    <div onMouseMove={handleMouseMove} className="absolute inset-0 pointer-events-auto">
      <motion.div
        style={{ x, y }}
        className="pointer-events-none absolute h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl"
      />
    </div>
  );
}