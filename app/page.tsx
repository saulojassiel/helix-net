import Portal from "../components/Portal";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00f5ff33,transparent_35%),radial-gradient(circle_at_bottom,#7c3aed33,transparent_40%)]" />

      <div className="absolute h-96 w-96 rounded-full border border-cyan-400/40 shadow-[0_0_120px_#00f5ff] animate-pulse" />
      <div className="absolute h-[520px] w-[520px] rounded-full border border-purple-500/20 shadow-[0_0_160px_#7c3aed]" />

      <section className="relative z-10 text-center px-6">
        <Portal />
        <p className="mb-4 text-cyan-300 tracking-[0.4em] text-sm">
          ENTER THE DIGITAL DIMENSION
        </p>

        <h1 className="text-6xl md:text-8xl font-black tracking-widest drop-shadow-[0_0_25px_#00f5ff]">
          HELIX NET
        </h1>

        <p className="mt-6 text-xl text-zinc-300">
          Where Ideas Become Universes
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <button className="rounded-full bg-cyan-300 px-8 py-4 font-bold text-black shadow-[0_0_35px_#00f5ff] hover:scale-105 transition">
            Cruzar Portal
          </button>

          <button className="rounded-full border border-white/20 px-8 py-4 font-bold text-white hover:bg-white/10 transition">
            Explorar
          </button>
        </div>
      </section>
    </main>
  );
}