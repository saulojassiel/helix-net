export interface KernelState {
  version: number;
  universeId: string;
  graphId: string;
  timestamp: string;
}

export interface CreateKernelStateInput {
  universeId: string;
  graphId: string;
}

export function createInitialKernelState(
  input: CreateKernelStateInput
): KernelState {
  if (!input.universeId.trim()) {
    throw new Error("El estado debe pertenecer a un universo.");
  }

  if (!input.graphId.trim()) {
    throw new Error("El estado debe contener un grafo.");
  }

  return {
    version: 1,
    universeId: input.universeId,
    graphId: input.graphId,
    timestamp: new Date().toISOString(),
  };
}