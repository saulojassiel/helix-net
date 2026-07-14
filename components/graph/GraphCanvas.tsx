"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import type { HelixGraph } from "@/engine/graph/types";
import { adaptHelixGraphToReactFlow } from "@/adapters/graph/reactflow";

import GraphNode from "./GraphNode";

const nodeTypes = {
  helixNode: GraphNode,
};

interface GraphCanvasProps {
  graph: HelixGraph;
}

export default function GraphCanvas({
  graph,
}: GraphCanvasProps) {
  const flow = adaptHelixGraphToReactFlow(graph);

  return (
    <div className="h-[700px] w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-black">
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
      >
        <Background gap={28} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}