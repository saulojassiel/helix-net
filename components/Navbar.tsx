"use client";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-cyan-500/20 bg-black/20 px-10 py-5 backdrop-blur-xl">
      <h1 className="text-2xl font-black tracking-widest text-cyan-300">
        HELIX NET
      </h1>

      <div className="flex gap-8 text-zinc-300">
        <button className="transition hover:text-cyan-300">Universos</button>
        <button className="transition hover:text-cyan-300">Resonancias</button>
        <button className="transition hover:text-cyan-300">IA</button>
        <button className="transition hover:text-cyan-300">Biblioteca</button>
      </div>
    </nav>
  );
}