"use client";

import type {
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  OnNodeDrag,
} from "@xyflow/react";

import UniverseGraph from "./UniverseGraph";

interface GraphWorkspaceProps {
  nodes: Node[];
  edges: Edge[];
  onNodeDragStop: OnNodeDrag;
  onConnect: (connection: Connection) => void;
  onNodeClick: NodeMouseHandler;
}

export default function GraphWorkspace({
  nodes,
  edges,
  onNodeDragStop,
  onConnect,
  onNodeClick,
}: GraphWorkspaceProps) {
  return (
    <section className="min-w-0">
      <h2 className="text-2xl font-bold">
        Universo visual
      </h2>

      <div className="mt-5">
        <UniverseGraph
          nodes={nodes}
          edges={edges}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
        />
      </div>
    </section>
  );
}