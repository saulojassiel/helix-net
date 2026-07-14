import type { Universe } from "@/types/universe";

interface UniverseCardProps {
  universe: Universe;
}

export default function UniverseCard({
  universe,
}: UniverseCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-500/30 bg-zinc-950 p-6 transition hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Universo
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {universe.title}
          </h2>
        </div>

        <div className="h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_20px_#67e8f9]" />
      </div>

      <p className="mt-4 line-clamp-3 text-zinc-400">
        {universe.description || "Este universo aún no tiene descripción."}
      </p>

      <p className="mt-6 text-sm text-zinc-600">
        Creado el{" "}
        {new Date(universe.created_at).toLocaleDateString("es-MX")}
      </p>

      <button className="mt-6 w-full rounded-xl border border-cyan-500/40 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-300 hover:text-black">
        Entrar al universo
      </button>
    </article>
  );
}