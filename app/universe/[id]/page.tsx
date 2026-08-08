"use client";

import { useParams } from "next/navigation";

import GraphWorkspace from "@/components/graph/GraphWorkspace";
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";
import { AddIdeaPanel } from "@/components/panels/AddIdeaPanel";
import ExplorerPanel from "@/components/panels/ExplorerPanel";
import InspectorPanel from "@/components/panels/InspectorPanel";
import UniverseHeader from "@/components/universes/UniverseHeader";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function UniversePage() {
  const params = useParams<{ id: string }>();

  const {
    universe,
    graph,
    nodes,

    flowNodes,
    flowEdges,

    selectedNode,
    selectedNodeId,
    setSelectedNodeId,

    selectedEdge,

    title,
    content,
    isCreating,
    setTitle,
    setContent,
    addIdea,

    edgeType,
    setEdgeType,

    edgeStrength,
    setEdgeStrength,

    edgeConfidence,
    setEdgeConfidence,

    edgeDescription,
    setEdgeDescription,

    isUpdatingEdge,
    updateSelectedEdge,

    loading,
    errorMessage,

    handleNodeDragStop,
    handleNodeClick,
    handleEdgeClick,
    handleConnect,
  } = useWorkspace(params.id);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Cargando universo...
      </main>
    );
  }

  if (
    errorMessage ||
    !universe ||
    !graph
  ) {
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
          onEdgeClick={handleEdgeClick}
        />
      }

      inspector={
        <InspectorPanel
          node={selectedNode}
          edge={selectedEdge}

          edgeType={edgeType}
          onEdgeTypeChange={setEdgeType}

          edgeStrength={edgeStrength}
          onEdgeStrengthChange={setEdgeStrength}

          edgeConfidence={edgeConfidence}
          onEdgeConfidenceChange={setEdgeConfidence}

          edgeDescription={edgeDescription}
          onEdgeDescriptionChange={setEdgeDescription}

          isUpdatingEdge={isUpdatingEdge}
          onUpdateEdge={updateSelectedEdge}
        />
      }
    />
  );
}