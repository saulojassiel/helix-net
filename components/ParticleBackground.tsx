export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_#00ffff]" />
      <div className="absolute left-2/3 top-1/3 h-1 w-1 rounded-full bg-purple-300 shadow-[0_0_18px_#a855f7]" />
      <div className="absolute left-1/2 top-2/3 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_16px_#ffffff]" />
      <div className="absolute left-1/5 top-3/4 h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_14px_#67e8f9]" />
      <div className="absolute left-3/4 top-4/5 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_20px_#e879f9]" />
    </div>
  );
}