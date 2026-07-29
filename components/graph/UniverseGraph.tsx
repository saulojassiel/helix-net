"use client";

import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type HelixNodeData = {
  label: string;
  status?: string;
};

function HelixNode({ data }: NodeProps) {
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
        type="source"
        position={Position.Right}
      />
    </div>
  );
}

const nodeTypes = {
  helix: (props: NodeProps) => <HelixNode {...props} />,
};

interface UniverseGraphProps {
  nodes: Node[];
  edges: Edge[];
}

export default function UniverseGraph({
  nodes,
  edges,
}: UniverseGraphProps) {
  return (
    <div className="h-[700px] w-full rounded-2xl border border-cyan-500/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}