"use client";

import { useEffect } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnConnect,
  type OnNodeDrag,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { HelixNode } from "./HelixNode";

interface UniverseGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeDragStop: OnNodeDrag;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler;
}

const nodeTypes = {
  helix: HelixNode,
};

export default function UniverseGraph({
  nodes,
  edges,
  onNodeDragStop,
  onConnect,
  onNodeClick,
}: UniverseGraphProps) {
  const [
    localNodes,
    setLocalNodes,
    onNodesChange,
  ] = useNodesState(nodes);

  const [
    localEdges,
    setLocalEdges,
    onEdgesChange,
  ] = useEdgesState(edges);

  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  return (
    <div className="h-[700px] w-full rounded-2xl border border-cyan-500/20">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}