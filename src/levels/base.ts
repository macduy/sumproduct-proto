import { LevelPack, LevelSpec } from "levels"
import { xySelection } from "types"

const level1: LevelSpec = {
    setup: {
        emptyCells: [
            xySelection([3, 6], [3, 6])
        ],
    },
    targets: [16]
}

const level2: LevelSpec = {
    setup: {
        emptyCells: [
            xySelection([2, 7], [2, 4]),
            xySelection([5, 7], [5, 7]),
            xySelection(4, 7)
        ],
    },
    targets: [28],
}

const level3: LevelSpec = {
    setup: {
        emptyCells: [
            xySelection([0, 9], [0, 9])
        ],
    },
    targets: [36, 29, 12, 18, 5]
}

export const BASE_LEVELS: LevelPack = {
    levels: [
        level1,
        level2,
        level3
    ],
}