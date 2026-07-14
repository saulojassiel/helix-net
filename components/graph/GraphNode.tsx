"use client";

import {
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";

type HelixNodeData = {
  label: string;
  node: {
    energy: number;
    status: string;
    type: string;
  };
};

type HelixFlowNode = Node<HelixNodeData, "helixNode">;

export default function GraphNode({
  data,
}: NodeProps<HelixFlowNode>) {
  return (
    <div className="relative flex flex-col items-center">
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0"
      />

      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.35)] backdrop-blur-md transition-all duration-500 hover:scale-110">
        <div className="h-10 w-10 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_35px_#67e8f9]" />
      </div>

      <h3 className="mt-4 max-w-40 text-center font-bold text-white">
        {data.label}
      </h3>

      <p className="text-xs text-cyan-300">
        {data.node.type}
      </p>

      <p className="text-xs text-zinc-400">
        Energía {data.node.energy}
      </p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0"
      />
    </div>
  );
}