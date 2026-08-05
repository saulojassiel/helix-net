"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { UniverseService } from "@/services/UniverseService";

const universeService = new UniverseService  (); 

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
  setLoading(true);
  setErrorMessage("");

  const {
    data: universeData,
    error: universeError,
  } = await supabase
    .from("universes")
    .select("id, title, description")
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

  const {
    data: graphData,
    error: graphError,
  } = await supabase
    .from("graphs")
    .select("id")
    .eq("universe_id", universeId)
    .maybeSingle();

  if (graphError || !graphData) {
    setErrorMessage(
      graphError?.message ??
        "Grafo no encontrado."
    );
    setLoading(false);
    return;
  }

  const {
    data: nodeData,
    error: nodeError,
  } = await supabase
    .from("nodes")
    .select(
      "id, title, content, status, position_x, position_y"
    )
    .eq("universe_id", universeId)
    .order("created_at", {
      ascending: true,
    });

  if (nodeError) {
    setErrorMessage(nodeError.message);
    setLoading(false);
    return;
  }

  const {
    data: edgeData,
    error: edgeError,
  } = await supabase
    .from("edges")
    .select(
      "id, source_node_id, target_node_id, type"
    )
    .eq("universe_id", universeId);

  if (edgeError) {
    setErrorMessage(edgeError.message);
    setLoading(false);
    return;
  }

  setUniverse(universeData);
  setGraph(graphData);
  setNodes(nodeData ?? []);
  setEdges(edgeData ?? []);
  setLoading(false);
}, [universeId]);

async function addIdea() {
  if (!graph || !title.trim()) {
    return;
  }

  try {
    setIsCreating(true);

    await universeService.addIdea(
      universeId,
      graph.id,
      title,
      content
    );

    setTitle("");
    setContent("");

    await loadWorkspace();
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : "No se pudo crear la idea."
    );
  } finally {
    setIsCreating(false);
  }
}

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

  const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [isCreating, setIsCreating] = useState(false);
  
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
title,
content,
isCreating,
setTitle,
setContent,
addIdea,
  };
}