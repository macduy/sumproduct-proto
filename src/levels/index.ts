import { XYSelection } from "types";

/** Specification for a level */
export interface LevelSpec {
    setup: {
        emptyCells: XYSelection[]
    }
    targets: number[]
    ratingBands: [number, number, number]
}

export interface LevelPack {
    levels: LevelSpec[]
}

export function evaluateRating(score: number, bands: [number, number, number]): number {
    let rating = 0
    for (const band of bands) {
        if (score < band) break
        rating++
    }
    return rating
}