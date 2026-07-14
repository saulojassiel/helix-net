import type { NodeType } from "./types";

export interface NodeValidationInput {
  universeId: string;
  authorId: string;
  title: string;
  content: string;
  type?: NodeType;
}

export interface NodeValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateNodeInput(
  input: NodeValidationInput
): NodeValidationResult {
  const errors: string[] = [];

  if (!input.universeId.trim()) {
    errors.push("El nodo debe pertenecer a un universo.");
  }

  if (!input.authorId.trim()) {
    errors.push("El nodo debe tener un autor.");
  }

  if (input.title.trim().length < 3) {
    errors.push("El título debe tener al menos 3 caracteres.");
  }

  if (input.title.trim().length > 120) {
    errors.push("El título no puede superar 120 caracteres.");
  }

  if (input.content.trim().length < 5) {
    errors.push("El contenido debe tener al menos 5 caracteres.");
  }

  if (input.content.trim().length > 10000) {
    errors.push("El contenido no puede superar 10,000 caracteres.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}