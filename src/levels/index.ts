import { XYSelection } from "types";

/** Specification for a level */
export interface LevelSpec {
    setup: {
        emptyCells: XYSelection[]
    }
    targets: number[]
}


export interface LevelPack {
    levels: LevelSpec[]
}