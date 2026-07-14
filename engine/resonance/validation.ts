import type { ResonanceType } from "./types";

export interface ResonanceValidationInput {
  universeId: string;
  authorId: string;
  title: string;
  content: string;
  type?: ResonanceType;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateResonanceInput(
  input: ResonanceValidationInput
): ValidationResult {
  const errors: string[] = [];

  if (!input.universeId.trim()) {
    errors.push("La resonancia debe pertenecer a un universo.");
  }

  if (!input.authorId.trim()) {
    errors.push("La resonancia debe tener un autor.");
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

  if (input.content.trim().length > 5000) {
    errors.push("El contenido no puede superar 5000 caracteres.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}