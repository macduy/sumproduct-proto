export interface XYSelection {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
}

export function xySelection(x: [number, number] | number, y: [number, number] | number): XYSelection {
    if (typeof x === "number") x = [x, x]
    if (typeof y === "number") y = [y, y]
    return { minX: x[0], maxX: x[1], minY: y[0], maxY: y[1]}
}

export function iterate(s: XYSelection, callback: (x: number, y: number) => void) {
    for (let x = s.minX; x <= s.maxX; x++) {
        for (let y = s.minY; y <= s.maxY; y++) {
            callback(x, y)
        }
    }
}