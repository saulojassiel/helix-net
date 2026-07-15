import { CreativeChunk } from "./chunks";

import { calculateCreativeWeight } from "./weights";

export function buildTransferPlan(
    chunks:CreativeChunk[]
){

    return chunks.map(chunk=>({

        id:chunk.id,

        weight:calculateCreativeWeight(chunk),

        priority:
            calculateCreativeWeight(chunk)>0.75
            ?"HIGH"
            :"LOW"

    }));

}