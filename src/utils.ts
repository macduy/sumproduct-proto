interface Number {
    pad(width: number, z?: string): string
}

Number.prototype.pad = function(width: number, z: string = "0") {
    const n = this + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}