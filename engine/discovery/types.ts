import type { HelixNode } from "../node/types";
import type { ConnectionSuggestion } from "../physics/suggestions";
import type { GraphCommunity } from "./communities";
import type { BridgeNodeInsight } from "./bridges";

export interface IsolatedNodeInsight {
  node: HelixNode;
  reason: string;
}

export interface DiscoveryReport {
  isolatedNodes: IsolatedNodeInsight[];
  connectionSuggestions: ConnectionSuggestion[];

  communities: GraphCommunity[];
  bridgeNodes: BridgeNodeInsight[];

  metrics: {
    isolatedNodeCount: number;
    suggestionCount: number;
    communityCount: number;
    bridgeNodeCount: number;
  };
}