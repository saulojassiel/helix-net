"use client";

interface ExplorerNode {
  id: string;
  title: string;
  status: string;
}

interface ExplorerPanelProps {
  nodes: ExplorerNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}

export default function ExplorerPanel({
  nodes,
  selectedNodeId,
  onSelectNode,
}: ExplorerPanelProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-zinc-950 p-5">
      <h2 className="text-xl font-bold">
        Explorador
      </h2>

      {nodes.length === 0 && (
        <p className="mt-4 text-zinc-500">
          Este universo todavía no tiene ideas.
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {nodes.map((node) => {
          const isSelected =
            node.id === selectedNodeId;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() =>
                onSelectNode(node.id)
              }
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-950/40"
                  : "border-zinc-800 bg-black hover:border-cyan-500"
              }`}
            >
              <p className="font-semibold text-cyan-200">
                {node.title}
              </p>

              <p className="mt-2 text-xs uppercase tracking-wider text-zinc-600">
                {node.status}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}