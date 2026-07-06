export default function Dashboard() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-black text-cyan-300">
        HELIX NET
      </h1>

      <p className="mt-4 text-zinc-400">
        Dashboard v1
      </p>

      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/30 bg-zinc-900 p-6">
          <h2 className="text-2xl">🌌 Universos</h2>
        </div>

        <div className="rounded-2xl border border-purple-500/30 bg-zinc-900 p-6">
          <h2 className="text-2xl">🧠 Resonancias</h2>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-zinc-900 p-6">
          <h2 className="text-2xl">🤖 IA</h2>
        </div>
      </div>
    </main>
  );
}