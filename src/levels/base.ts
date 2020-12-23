import { LevelPack, LevelSpec } from "levels"
import { XYSelection } from "types"

const level1: LevelSpec = {
    setup: {
        emptyCells: [
            XYSelection.range([3, 6], [3, 6])
        ],
    },
    targets: [16],
    ratingBands: [50, 100, 144],
}

const level2: LevelSpec = {
    setup: {
        emptyCells: [
            XYSelection.range([2, 7], [2, 4]),
            XYSelection.range([5, 7], [5, 7]),
            XYSelection.range(4, 7)
        ],
    },
    targets: [28],
    ratingBands: [120, 156, 192],
}

const level3: LevelSpec = {
    setup: {
        emptyCells: [
            XYSelection.range([2, 7], [2, 7])
        ],
    },
    targets: [9, 16, 7, 4],
    ratingBands: [284, 295, 300],
}


const level4: LevelSpec = {
    setup: {
        emptyCells: [
            XYSelection.range([0, 9], [0, 9])
        ],
    },
    targets: [36, 29, 12, 18, 5],
    ratingBands: [770, 800, 830],
}

export const BASE_LEVELS: LevelPack = {
    levels: [
        level1,
        level2,
        level3,
        level4,
    ],
}