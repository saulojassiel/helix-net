import type { KernelEvent } from "./events";
import type { KernelState } from "./state";

export interface HelixLaw {
  id: string;
  name: string;
  description: string;

  appliesTo(event: KernelEvent): boolean;

  apply(
    state: KernelState,
    event: KernelEvent
  ): KernelState;
}