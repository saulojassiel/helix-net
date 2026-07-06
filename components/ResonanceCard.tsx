export default function ResonanceCard() {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-zinc-900 p-6 shadow-[0_0_30px_#7c3aed40]">
      <h2 className="text-2xl font-bold text-purple-300">
        🧠 Resonancias
      </h2>

      <p className="mt-3 text-zinc-400">
        Crea, conecta y expande ideas.
      </p>

      <button className="mt-6 rounded-full bg-purple-400 px-6 py-3 font-bold text-black transition hover:scale-105">
        Crear Resonancia
      </button>
    </div>
  );
}