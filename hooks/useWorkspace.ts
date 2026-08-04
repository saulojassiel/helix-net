"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export interface WorkspaceUniverse {
  id: string;
  title: string;
  description: string | null;
}

export interface WorkspaceGraph {
  id: string;
}

export interface WorkspaceNode {
  id: string;
  title: string;
  content: string;
  status: string;
  position_x: number;
  position_y: number;
}

export interface WorkspaceEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  type: string;
}

export function useWorkspace(universeId: string) {
  const [universe, setUniverse] =
    useState<WorkspaceUniverse | null>(null);

  const [graph, setGraph] =
    useState<WorkspaceGraph | null>(null);

  const [nodes, setNodes] =
    useState<WorkspaceNode[]>([]);

  const [edges, setEdges] =
    useState<WorkspaceEdge[]>([]);
    const [
    selectedNodeId,
    setSelectedNodeId,
] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadWorkspace = useCallback(async () => {
  setErrorMessage("");

  const {
    data: universeData,
    error: universeError,
  } = await supabase
    .from("universes")
    .select("id,title,description")
    .eq("id", universeId)
    .maybeSingle();

  if (universeError || !universeData) {
    setErrorMessage(
      universeError?.message ??
        "Universo no encontrado."
    );

    setLoading(false);
    return;
  }

  setUniverse(universeData);

  setLoading(false);
}, [universeId]);

 useEffect(() => {
  const timer = setTimeout(() => {
    void loadWorkspace();
  }, 0);

  return () => clearTimeout(timer);
}, [loadWorkspace]);

const selectedNode =
  nodes.find(
    (node) => node.id === selectedNodeId
  ) ?? null;
  
  return {
    universe,
    graph,
    nodes,
    edges,
    loading,
    errorMessage,
    loadWorkspace,
    setUniverse,
    setGraph,
    setNodes,
    setEdges,
    setLoading,
    setErrorMessage,
    selectedNodeId,
setSelectedNodeId,
selectedNode,
  };
}