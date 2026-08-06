"use client";

import { useParams } from "next/navigation";
import type {
  Connection,
 
  NodeMouseHandler,
  OnNodeDrag,
} from "@xyflow/react";

import GraphWorkspace from "@/components/graph/GraphWorkspace";
import { AddIdeaPanel } from "@/components/panels/AddIdeaPanel";
import ExplorerPanel from "@/components/panels/ExplorerPanel";
import InspectorPanel from "@/components/panels/InspectorPanel";
import UniverseHeader from "@/components/universes/UniverseHeader";
import { useWorkspace } from "@/hooks/useWorkspace";
import { UniverseService } from "@/services/UniverseService";

const universeService = new UniverseService();
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";

export default function UniversePage() {
  const params = useParams<{ id: string }>();

  const workspace = useWorkspace(params.id);

  const {
    universe,
    graph,
    nodes,
    edges,
    flowNodes,
flowEdges,
    loading,
    errorMessage,
    loadWorkspace,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    title,
    content,
    isCreating,
    setTitle,
    setContent,
    addIdea,
    selectNode,
  } = workspace;

  

 

 

  const handleNodeDragStop: OnNodeDrag = (
    _,
    node
  ) => {
    void universeService
      .moveNode(
        node.id,
        node.position.x,
        node.position.y
      )
      .catch((error: unknown) => {
        console.error(
          "No se pudo guardar la posición:",
          error
        );
      });
  };

  async function handleConnect(
    connection: Connection
  ) {
    const source = connection.source;
    const target = connection.target;

    if (!source || !target) {
      return;
    }

    if (source === target) {
      alert(
        "No puedes conectar una idea consigo misma."
      );
      return;
    }

    const alreadyExists = edges.some(
      (edge) =>
        edge.source_node_id === source &&
        edge.target_node_id === target &&
        edge.type === "inspira"
    );

    if (alreadyExists) {
      alert("Esta conexión ya existe.");
      return;
    }

    try {
      await universeService.connectIdeas(
        params.id,
        source,
        target,
        "inspira"
      );

      await loadWorkspace();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo crear la conexión."
      );
    }
  }

 const handleNodeClick: NodeMouseHandler = (
  _,
  node
) => {
  selectNode(node.id);
};

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Cargando universo...
      </main>
    );
  }

  if (errorMessage || !universe || !graph) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-3xl font-bold">
          No se pudo abrir el universo
        </h1>

        <p className="mt-4 text-red-300">
          {errorMessage}
        </p>
      </main>
    );
  }

  return (
    <WorkspaceLayout
  header={
    <UniverseHeader
      title={universe.title}
      description={universe.description}
    />
  }
  explorer={
    <>
      <AddIdeaPanel
        title={title}
        content={content}
        isCreating={isCreating}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onCreate={addIdea}
      />

      <ExplorerPanel
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        onSelectNode={setSelectedNodeId}
      />
    </>
  }
  graph={
    <GraphWorkspace
      nodes={flowNodes}
      edges={flowEdges}
      onNodeDragStop={handleNodeDragStop}
      onConnect={handleConnect}
      onNodeClick={handleNodeClick}
    />
  }
  inspector={
    <InspectorPanel node={selectedNode} />
  }
/>
  );
}