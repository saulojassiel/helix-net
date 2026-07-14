export interface KernelEvent<TPayload = unknown> {
  id: string;
  type: string;
  createdAt: string;
  payload: TPayload;
}

export interface CreateKernelEventInput<TPayload> {
  type: string;
  payload: TPayload;
}

export function createKernelEvent<TPayload>(
  input: CreateKernelEventInput<TPayload>
): KernelEvent<TPayload> {
  if (!input.type.trim()) {
    throw new Error("El evento debe tener un tipo.");
  }

  return {
    id: crypto.randomUUID(),
    type: input.type.trim(),
    createdAt: new Date().toISOString(),
    payload: input.payload,
  };
}