"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeMouseHandler,
  type Node,
  type NodeMouseHandler,
  type OnConnect,
  type OnNodeDrag,
  type ReactFlowInstance,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { HelixNode } from "./HelixNode";

interface UniverseGraphProps {
  nodes?: Node[];
  edges?: Edge[];
  onNodeDragStop: OnNodeDrag;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler;
  onEdgeClick: EdgeMouseHandler;
}

const EMPTY_NODES: Node[] = [];
const EMPTY_EDGES: Edge[] = [];

const nodeTypes = {
  helix: HelixNode,
};

export default function UniverseGraph({
  nodes = EMPTY_NODES,
  edges = EMPTY_EDGES,
  onNodeDragStop,
  onConnect,
  onNodeClick,
  onEdgeClick,
}: UniverseGraphProps) {
  const flowInstanceRef =
    useRef<ReactFlowInstance | null>(null);

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

  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void flowInstanceRef.current?.fitView({
        padding: 0.2,
        duration: 300,
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [nodes]);

  return (
    <div className="h-[700px] w-full rounded-2xl border border-cyan-500/20">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
      >
        <MiniMap />

        <Controls />

        <Background />
      </ReactFlow>
    </div>
  );
}