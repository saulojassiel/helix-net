interface InspectorNode {
  id: string;
  title: string;
  content: string;
  status: string;
}

interface InspectorPanelProps {
  node: InspectorNode | null;
}

export default function InspectorPanel({
  node,
}: InspectorPanelProps) {
  return (
    <aside className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-6">
      <h2 className="text-xl font-bold">
        Inspector
      </h2>

      {!node && (
        <p className="mt-4 text-zinc-500">
          Selecciona una idea del explorador o del grafo.
        </p>
      )}

      {node && (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-zinc-500">
            {node.status}
          </p>

          <h3 className="mt-3 text-2xl font-bold text-cyan-300">
            {node.title}
          </h3>

          <p className="mt-4 leading-7 text-zinc-300">
            {node.content ||
              "Esta idea todavía no tiene descripción."}
          </p>

          <div className="mt-8 border-t border-zinc-800 pt-5">
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Identificador
            </p>

            <p className="mt-2 break-all text-xs text-zinc-500">
              {node.id}
            </p>
          </div>
        </>
      )}
    </aside>
  );
}