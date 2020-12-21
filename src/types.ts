/** Represents a selection the grid. */
export class XYSelection {
    constructor(readonly minX: number,
        readonly maxX: number,
        readonly minY: number,
        readonly maxY: number) {}

    /** Construct from a x-range and y-range. */
    static range(x: [number, number] | number, y: [number, number] | number): XYSelection {
        if (typeof x === "number") x = [x, x]
        if (typeof y === "number") y = [y, y]
        return new XYSelection(x[0], x[1], y[0], y[1])
    }

    /** Construct from a start and end coordinate. */
    static startEnd(start: {x: number, y: number}, end: {x: number, y: number}): XYSelection {
        const minX = Math.min(start.x, end.x)
        const maxX = Math.max(start.x, end.x)
        const minY = Math.min(start.y, end.y)
        const maxY = Math.max(start.y, end.y)

        return new XYSelection(minX, maxX, minY, maxY)
    }

    iterate(callback: (x: number, y: number) => void) {
        for (let x = this.minX; x <= this.maxX; x++) {
            for (let y = this.minY; y <= this.maxY; y++) {
                callback(x, y)
            }
        }
    }
}
