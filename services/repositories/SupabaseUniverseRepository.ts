import { supabase } from "@/lib/supabase";

import type {
  CreateUniverseRecord,
  UniverseRecord,
  UniverseRepository,
} from "./UniverseRepository";

function toDatabaseRow(universe: CreateUniverseRecord) {
  return {
    id: universe.id,
    creator_id: universe.creatorId,
    title: universe.title,
    description: universe.description,
    created_at: universe.createdAt,
    updated_at: universe.updatedAt,
  };
}

function toUniverseRecord(row: {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}): UniverseRecord {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseUniverseRepository
  implements UniverseRepository
{
  async createUniverse(
    universe: CreateUniverseRecord
  ): Promise<UniverseRecord> {
    const { data, error } = await supabase
      .from("universes")
      .insert(toDatabaseRow(universe))
      .select()
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear el universo: ${error.message}`
      );
    }

    return toUniverseRecord(data);
  }

  async loadUniverse(
    universeId: string
  ): Promise<UniverseRecord | null> {
    const { data, error } = await supabase
      .from("universes")
      .select("*")
      .eq("id", universeId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `No se pudo cargar el universo: ${error.message}`
      );
    }

    return data ? toUniverseRecord(data) : null;
  }

  async plantSeed(question: string) {
    const { data, error } = await supabase.rpc(
      "plant_seed",
      {
        p_question: question,
      }
    );

    if (error) {
      throw new Error(
        `No se pudo sembrar el universo: ${error.message}`
      );
    }

    const result = data?.[0];

    if (!result) {
      throw new Error(
        "Supabase no devolvió los identificadores del universo."
      );
    }

    return {
      universeId: result.universe_id,
      graphId: result.graph_id,
      seedNodeId: result.seed_node_id,
    };
  }

  async addNode(
    universeId: string,
    graphId: string,
    title: string,
    content: string
  ) {
    const { data, error } = await supabase.rpc(
      "add_node",
      {
        p_universe_id: universeId,
        p_graph_id: graphId,
        p_title: title,
        p_content: content,
      }
    );

    if (error) {
      throw new Error(
        `No se pudo crear el nodo: ${error.message}`
      );
    }

    if (!data) {
      throw new Error(
        "Supabase no devolvió el identificador del nodo."
      );
    }

    return data;
  }

  async connectNodes(
  universeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  relationType: string,
  strength = 1,
  confidence = 1,
  description: string | null = null
) {
  const { data, error } = await supabase.rpc(
    "connect_nodes",
    {
      p_universe_id: universeId,
      p_source_node_id: sourceNodeId,
      p_target_node_id: targetNodeId,
      p_relation_type: relationType,
      p_strength: strength,
      p_confidence: confidence,
      p_description: description,
      p_evidence: [],
      p_metadata: {},
    }
  );

  if (error) {
    throw new Error(
      `No se pudo crear la relación: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el identificador de la relación."
    );
  }

  return data;
}
  async moveNode(
    nodeId: string,
    positionX: number,
    positionY: number
  ): Promise<void> {
    const { error } = await supabase.rpc(
      "move_node",
      {
        p_node_id: nodeId,
        p_position_x: positionX,
        p_position_y: positionY,
      }
    );

    if (error) {
      throw new Error(
        `No se pudo guardar la posición: ${error.message}`
      );
    }
  }
  async updateEdge(
  edgeId: string,
  relationType: string,
  strength: number,
  confidence: number,
  description: string | null,
  evidence: unknown[] = [],
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase.rpc(
    "update_edge",
    {
      p_edge_id: edgeId,
      p_relation_type: relationType,
      p_strength: strength,
      p_confidence: confidence,
      p_description: description,
      p_evidence: evidence,
      p_metadata: metadata,
    }
  );

  if (error) {
    throw new Error(
      `No se pudo actualizar la relación: ${error.message}`
    );
  }
}
async updateNode(
  nodeId: string,
  title: string,
  content: string,
  status: string,
  priority: number,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabase.rpc(
    "update_node",
    {
      p_node_id: nodeId,
      p_title: title,
      p_content: content,
      p_status: status,
      p_priority: priority,
      p_metadata: metadata,
    }
  );

  if (error) {
    throw new Error(
      `No se pudo actualizar el nodo: ${error.message}`
    );
  }
}
}