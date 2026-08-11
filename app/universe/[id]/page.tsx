"use client";

import { useParams } from "next/navigation";

import GraphWorkspace from "@/components/graph/GraphWorkspace";
import WorkspaceLayout from "@/components/layout/WorkspaceLayout";
import { AddIdeaPanel } from "@/components/panels/AddIdeaPanel";
import AISuggestionsPanel from "@/components/panels/AISuggestionsPanel";
import CreateRelationPanel from "@/components/panels/CreateRelationPanel";
import ExplorerPanel from "@/components/panels/ExplorerPanel";
import GraphFiltersPanel from "@/components/panels/GraphFiltersPanel";
import InspectorPanel from "@/components/panels/InspectorPanel";
import UniverseHeader from "@/components/universes/UniverseHeader";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function UniversePage() {
  const params = useParams<{ id: string }>();

  const {
    universe,
    graph,

    nodes,
    edges,

    filteredNodes,
    filteredEdges,

    flowNodes,
    flowEdges,

    /*
     * =========================
     * SELECCIÓN
     * =========================
     */

    selectedNode,
    selectedNodeId,
    setSelectedNodeId,

    selectedEdge,

    /*
     * =========================
     * CREAR IDEA
     * =========================
     */

    title,
    content,
    isCreating,

    setTitle,
    setContent,

    addIdea,

    /*
     * =========================
     * EDITOR DE NODOS
     * =========================
     */

    nodeTitle,
    setNodeTitle,

    nodeContent,
    setNodeContent,

    nodeStatus,
    setNodeStatus,

    nodePriority,
    setNodePriority,

    isUpdatingNode,
    updateSelectedNode,

    /*
     * =========================
     * EDITOR DE RELACIONES
     * =========================
     */

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

    /*
     * =========================
     * EVIDENCIA
     * =========================
     */

    evidenceText,
    setEvidenceText,

    isAddingEvidence,
    addEvidenceToSelectedEdge,

    /*
     * =========================
     * KE-004
     * CONEXIÓN PENDIENTE
     * =========================
     */

    pendingConnection,

    pendingRelationType,
    setPendingRelationType,

    pendingRelationStrength,
    setPendingRelationStrength,

    pendingRelationConfidence,
    setPendingRelationConfidence,

    pendingRelationDescription,
    setPendingRelationDescription,

    isCreatingRelation,

    createPendingRelation,
    cancelPendingRelation,

    /*
     * =========================
     * KE-005
     * FILTROS
     * =========================
     */

    nodeStatusFilter,
    setNodeStatusFilter,

    minimumPriority,
    setMinimumPriority,

    relationTypeFilter,
    setRelationTypeFilter,

    minimumConfidence,
    setMinimumConfidence,

    minimumStrength,
    setMinimumStrength,

    /*
     * =========================
     * AI-001
     * =========================
     */

    aiSuggestions,
    isExpandingIdea,
    aiErrorMessage,

    expandSelectedNode,
    acceptAISuggestion,
    rejectAISuggestion,

    /*
     * =========================
     * AI-001.2
     * EDICIÓN DE SUGERENCIAS
     * =========================
     */

    editingSuggestionId,

    editingSuggestionTitle,
    setEditingSuggestionTitle,

    editingSuggestionContent,
    setEditingSuggestionContent,

    editingSuggestionRelationType,
    setEditingSuggestionRelationType,

    startEditingAISuggestion,
    cancelEditingAISuggestion,
    saveEditedAISuggestion,

    /*
     * =========================
     * GENERAL
     * =========================
     */

    loading,
    errorMessage,

    /*
     * =========================
     * REACT FLOW
     * =========================
     */

    handleNodeDragStop,
    handleNodeClick,
    handleEdgeClick,
    handleConnect,
  } = useWorkspace(params.id);

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Cargando universo...
      </main>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */

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

  /*
   * =========================
   * WORKSPACE
   * =========================
   */

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

          <GraphFiltersPanel
            nodeStatusFilter={nodeStatusFilter}
            onNodeStatusFilterChange={setNodeStatusFilter}

            minimumPriority={minimumPriority}
            onMinimumPriorityChange={setMinimumPriority}

            relationTypeFilter={relationTypeFilter}
            onRelationTypeFilterChange={setRelationTypeFilter}

            minimumConfidence={minimumConfidence}
            onMinimumConfidenceChange={setMinimumConfidence}

            minimumStrength={minimumStrength}
            onMinimumStrengthChange={setMinimumStrength}

            visibleNodes={filteredNodes.length}
            totalNodes={nodes.length}

            visibleEdges={filteredEdges.length}
            totalEdges={edges.length}
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
        pendingConnection ? (
          <CreateRelationPanel
            relationType={pendingRelationType}
            onRelationTypeChange={setPendingRelationType}

            strength={pendingRelationStrength}
            onStrengthChange={setPendingRelationStrength}

            confidence={pendingRelationConfidence}
            onConfidenceChange={setPendingRelationConfidence}

            description={pendingRelationDescription}
            onDescriptionChange={setPendingRelationDescription}

            isCreating={isCreatingRelation}

            onCreate={createPendingRelation}
            onCancel={cancelPendingRelation}
          />
        ) : (
          <div className="space-y-6">
            <InspectorPanel
              node={selectedNode}
              edge={selectedEdge}

              nodeTitle={nodeTitle}
              onNodeTitleChange={setNodeTitle}

              nodeContent={nodeContent}
              onNodeContentChange={setNodeContent}

              nodeStatus={nodeStatus}
              onNodeStatusChange={setNodeStatus}

              nodePriority={nodePriority}
              onNodePriorityChange={setNodePriority}

              isUpdatingNode={isUpdatingNode}
              onUpdateNode={updateSelectedNode}

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

              evidenceText={evidenceText}
              onEvidenceTextChange={setEvidenceText}

              isAddingEvidence={isAddingEvidence}
              onAddEvidence={addEvidenceToSelectedEdge}
            />

            <AISuggestionsPanel
              hasSelectedNode={Boolean(selectedNode)}

              suggestions={aiSuggestions}

              isExpanding={isExpandingIdea}
              errorMessage={aiErrorMessage}

              onExpand={expandSelectedNode}

              onAcceptSuggestion={acceptAISuggestion}
              onRejectSuggestion={rejectAISuggestion}

              editingSuggestionId={editingSuggestionId}

              editingTitle={editingSuggestionTitle}
              onEditingTitleChange={
                setEditingSuggestionTitle
              }

              editingContent={editingSuggestionContent}
              onEditingContentChange={
                setEditingSuggestionContent
              }

              editingRelationType={
                editingSuggestionRelationType
              }
              onEditingRelationTypeChange={
                setEditingSuggestionRelationType
              }

              onStartEditing={
                startEditingAISuggestion
              }

              onCancelEditing={
                cancelEditingAISuggestion
              }

              onSaveEditing={
                saveEditedAISuggestion
              }
            />
          </div>
        )
      }
    />
  );
}