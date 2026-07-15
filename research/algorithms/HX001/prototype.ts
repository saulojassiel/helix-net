import type { CreativeChunk } from "./chunks";
import { buildTransferPlan } from "./planner";

const sampleChunks: CreativeChunk[] = [
  {
    id: "chunk-vocal",
    offset: 0,
    size: 4200,
    entropy: 0.92,
    editable: true,
  },
  {
    id: "chunk-background",
    offset: 4200,
    size: 8500,
    entropy: 0.28,
    editable: false,
  },
  {
    id: "chunk-transient",
    offset: 12700,
    size: 2100,
    entropy: 0.84,
    editable: true,
  },
  {
    id: "chunk-silence",
    offset: 14800,
    size: 6400,
    entropy: 0.03,
    editable: false,
  },
];

const transferPlan = buildTransferPlan(sampleChunks);

console.table(transferPlan);