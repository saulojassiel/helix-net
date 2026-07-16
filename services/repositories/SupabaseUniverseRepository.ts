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
  const { data, error } = await supabase.rpc("plant_seed", {
    p_question: question,
  });

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
  const { data, error } = await supabase.rpc("add_node", {
    p_universe_id: universeId,
    p_graph_id: graphId,
    p_title: title,
    p_content: content,
  });

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
}