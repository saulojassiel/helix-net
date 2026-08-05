"use client";

import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

type HelixNodeData = {
  label: string;
  status?: string;
};

export function HelixNode({
  data,
}: NodeProps) {
  const nodeData = data as HelixNodeData;

  const isSeed =
    nodeData.status?.toUpperCase() === "SEED";

  return (
    <div
      className={`min-w-56 rounded-2xl border p-4 shadow-xl ${
        isSeed
          ? "border-cyan-400 bg-cyan-950/80"
          : "border-violet-500 bg-zinc-900"
      }`}
    >
      <Handle
        id="target"
        type="target"
        position={Position.Left}
      />

      <p className="text-xs uppercase tracking-widest text-zinc-400">
        {isSeed ? "SEED" : "IDEA"}
      </p>

      <h3 className="mt-2 text-lg font-bold text-white">
        {nodeData.label}
      </h3>

      <Handle
        id="source"
        type="source"
        position={Position.Right}
      />
    </div>
  );
}