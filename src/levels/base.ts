import { LevelPack } from "levels"
import { XYSelection } from "types"

export const BASE_LEVELS: LevelPack = {
    levels: [
        /** Tutorial: First one */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([2, 7], [4, 5])
                ],
            },
            targets: [12],
            ratingBands: [30, 40, 48],
        },
        /** Tutorial: Square */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([3, 6], [3, 6])
                ],
            },
            targets: [16],
            ratingBands: [40, 60, 80],
        },
        /** Tutorial: Small rectangle. */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([2, 7], [3, 6])
                ],
            },
            targets: [24],
            ratingBands: [96, 104, 108],
        },
        /** Tutorial: Multiple targets. */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([2 , 7], [2, 4]),
                    XYSelection.range([5, 7], [5, 7]),
                    XYSelection.range(4, 7)
                ],
            },
            targets: [28],
            ratingBands: [101, 109, 110],
        },
        /** Small Square. */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([2, 7], [2, 7])
                ],
            },
            targets: [9, 16, 7, 4],
            ratingBands: [130, 150, 163],
        },
        /** Galaxy */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([0, 2], [2, 5]),
                    XYSelection.range([3, 5], [4, 5]),
                    XYSelection.range([6, 9], [4, 7])
                ],
            },
            targets: [14, 13, 7],
            ratingBands: [140, 146, 148],
        },
        /** Big Square */
        {
            setup: {
                emptyCells: [
                    XYSelection.range([0, 9], [0, 9])
                ],
            },
            targets: [36, 29, 12, 18, 5],
            ratingBands: [450, 465, 471],
        },
    ],
}