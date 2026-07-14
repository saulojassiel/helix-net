import type { EdgeType } from "./types";

export interface EdgeValidationInput {
  universeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  creatorId: string;
  type?: EdgeType;
  strength?: number;
  confidence?: number;
  description?: string | null;
}

export interface EdgeValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEdgeInput(
  input: EdgeValidationInput
): EdgeValidationResult {
  const errors: string[] = [];

  if (!input.universeId.trim()) {
    errors.push("La conexión debe pertenecer a un universo.");
  }

  if (!input.creatorId.trim()) {
    errors.push("La conexión debe tener un creador.");
  }

  if (!input.sourceNodeId.trim()) {
    errors.push("La conexión debe tener un nodo de origen.");
  }

  if (!input.targetNodeId.trim()) {
    errors.push("La conexión debe tener un nodo de destino.");
  }

  if (
    input.sourceNodeId.trim() &&
    input.targetNodeId.trim() &&
    input.sourceNodeId === input.targetNodeId
  ) {
    errors.push("Un nodo no puede conectarse consigo mismo.");
  }

  const strength = input.strength ?? 1;
  const confidence = input.confidence ?? 1;

  if (strength < 0 || strength > 1) {
    errors.push("La fuerza debe estar entre 0 y 1.");
  }

  if (confidence < 0 || confidence > 1) {
    errors.push("La confianza debe estar entre 0 y 1.");
  }

  if ((input.description?.trim().length ?? 0) > 500) {
    errors.push("La descripción no puede superar 500 caracteres.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}