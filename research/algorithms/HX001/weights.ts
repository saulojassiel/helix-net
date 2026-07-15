import { CreativeChunk } from "./chunks";

export function calculateCreativeWeight(
    chunk:CreativeChunk
){

    let score=0;

    if(chunk.editable){

        score+=0.4;

    }

    score+=chunk.entropy*0.6;

    return Math.min(score,1);

}