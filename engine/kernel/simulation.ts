import type { KernelEvent } from "./events";
import type { HelixLaw } from "./laws";
import type { KernelState } from "./state";

export interface StateTransition {
  previousState: KernelState;
  event: KernelEvent;
  appliedLawIds: string[];
  nextState: KernelState;
}

export function applyKernelEvent(
  currentState: KernelState,
  event: KernelEvent,
  laws: HelixLaw[] = []
): StateTransition {
  let nextState: KernelState = {
    ...currentState,
    version: currentState.version + 1,
    timestamp: event.createdAt,
  };

  const appliedLawIds: string[] = [];

  for (const law of laws) {
    if (!law.appliesTo(event)) {
      continue;
    }

    nextState = law.apply(nextState, event);
    appliedLawIds.push(law.id);
  }

  return {
    previousState: currentState,
    event,
    appliedLawIds,
    nextState,
  };
}