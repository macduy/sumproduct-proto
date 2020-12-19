import { Cell, CellState } from "elements/cell"
import * as React from "react"
import { Component } from "react"


interface GridCellData {
    block?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 10
const CELL_SIZE = 50

interface GridProps {
}

interface GridState {
    selectionStart?: { x: number, y: number }
    selectionEnd?: { x: number, y: number }

    gridCellData: GridCellData[][]
}



export class Grid extends Component<GridProps, GridState> {
    state: GridState = {
        gridCellData: initializeGridData(GRID_WIDTH, GRID_HEIGHT)
    }

    onCellDown(x: number, y: number) {
        this.setState({
            selectionStart: { x, y }
        })
    }

    onCellMove(x: number, y: number) {
        this.setState({
            selectionEnd: { x, y }
        })
    }

    onCellUp(x: number, y: number) {
        this.executeSelection()
        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
    }

    onOutsideUp() {
        this.executeSelection()
        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
    }

    executeSelection() {
        const s = this.getNormalizedSelection()
        if (!s) return

        if (!this.checkSelectionClean()) {
            return
        }

        for (let x = s.minX; x <= s.maxX; x++) {
            for (let y = s.minY; y <= s.maxY; y++) {
                this.state.gridCellData[x][y].block = 1
            }
        }

        this.setState(this.state)
    }

    private isInsideSelection(x: number, y: number): boolean {
        const s = this.getNormalizedSelection()
        if (!s) return false

        return (x >= s.minX && x <= s.maxX && y >= s.minY && y <= s.maxY)
    }

    /** Checks if the selection only contains unassigned cells. */
    private checkSelectionClean(): boolean {
        const s = this.getNormalizedSelection()
        if (!s) return true

        for (let x = s.minX; x <= s.maxX; x++) {
            for (let y = s.minY; y <= s.maxY; y++) {
                if (this.state.gridCellData[x][y].block) return false
            }
        }

        return true
    }

    private getNormalizedSelection(): { minX: number, maxX: number, minY: number, maxY: number} | undefined {
        if (!this.state.selectionStart) return undefined
        if (!this.state.selectionEnd) {
            return {
                minX: this.state.selectionStart.x,
                maxX: this.state.selectionStart.x,
                minY: this.state.selectionStart.y,
                maxY: this.state.selectionStart.y,
            }
        }

        const minX = Math.min(this.state.selectionStart.x, this.state.selectionEnd.x)
        const maxX = Math.max(this.state.selectionStart.x, this.state.selectionEnd.x)
        const minY = Math.min(this.state.selectionStart.y, this.state.selectionEnd.y)
        const maxY = Math.max(this.state.selectionStart.y, this.state.selectionEnd.y)

        return {minX, maxX, minY, maxY}
    }

    private determineCellState(x: number, y: number, isSelectionClean: boolean): CellState {
        const isSelected = this.isInsideSelection(x, y)
        const isAssigned = this.state.gridCellData[x][y].block !== undefined

        if (isSelected) {
            if (!isSelectionClean) {
                return "selected-error"
            }
            return "selected"
        } else if (isAssigned) {
            return "assigned"
        }
        return "normal"    }

    render() {
        let cells: React.ReactChild[] = []

        const isSelectionClean = this.checkSelectionClean()

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                cells.push(<Cell
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    size={ CELL_SIZE }
                    state={ this.determineCellState(x, y, isSelectionClean) }
                    onMouseDown={ () => this.onCellDown(x, y) }
                    onMouseUp={ () => this.onCellUp(x, y) }
                    onMouseMove={ () => this.onCellMove(x, y) }
                />)
            }
        }

        return <div key="grid" className="grid" onMouseUp={ () => this.onOutsideUp()}>
            { cells }
        </div>
    }
}

function initializeGridData(width: number, height: number): GridCellData[][] {
    let data: GridCellData[][] = []
    for (let x = 0; x < width; x++) {
        let column: GridCellData[] = []
        for (let y = 0; y < height; y++) {
            column.push({})
        }
        data.push(column)
    }
    return data
}
