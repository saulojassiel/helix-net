"use client";

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

type HelixNodeData = {
  label: string;
  status?: string;
  priority?: number;
};

export function HelixNode({
  data,
}: NodeProps) {
  const nodeData = data as HelixNodeData;

  const status =
    nodeData.status?.toUpperCase() ?? "IDEA";

  const priority = Math.max(
    0,
    Math.min(100, nodeData.priority ?? 0)
  );

  const statusStyles: Record<
    string,
    {
      label: string;
      classes: string;
    }
  > = {
    SEED: {
      label: "SEED",
      classes:
        "border-cyan-300 bg-cyan-950/90 shadow-cyan-500/20",
    },

    IDEA: {
      label: "IDEA",
      classes:
        "border-violet-500 bg-zinc-900 shadow-violet-500/10",
    },

    HYPOTHESIS: {
      label: "HYPOTHESIS",
      classes:
        "border-amber-400 bg-amber-950/40 shadow-amber-500/10",
    },

    QUESTION: {
      label: "QUESTION",
      classes:
        "border-blue-400 bg-blue-950/40 shadow-blue-500/10",
    },

    EVIDENCE: {
      label: "EVIDENCE",
      classes:
        "border-emerald-400 bg-emerald-950/40 shadow-emerald-500/10",
    },

    ARCHIVED: {
      label: "ARCHIVED",
      classes:
        "border-zinc-700 bg-zinc-950 opacity-50",
    },
  };

  const visual =
    statusStyles[status] ??
    statusStyles.IDEA;

  const priorityLevel =
    priority >= 80
      ? "CRITICAL"
      : priority >= 50
        ? "HIGH"
        : priority >= 20
          ? "MEDIUM"
          : "LOW";

  const priorityStyle =
    priority >= 80
      ? "ring-2 ring-white/30 shadow-2xl"
      : priority >= 50
        ? "ring-1 ring-white/20 shadow-xl"
        : "shadow-lg";

  return (
    <div
      className={`min-w-56 rounded-2xl border p-4 transition-all ${visual.classes} ${priorityStyle}`}
    >
      <Handle
        id="target"
        type="target"
        position={Position.Left}
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-widest text-zinc-400">
          {visual.label}
        </p>

        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          {priorityLevel}
        </span>
      </div>

      <h3 className="mt-2 text-lg font-bold text-white">
        {nodeData.label}
      </h3>

      <div className="mt-4">
        <div className="h-1 overflow-hidden rounded-full bg-black/40">
          <div
            className="h-full bg-white/50 transition-all"
            style={{
              width: `${priority}%`,
            }}
          />
        </div>

        <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">
          Prioridad {priority}
        </p>
      </div>

      <Handle
        id="source"
        type="source"
        position={Position.Right}
      />
    </div>
  );
}