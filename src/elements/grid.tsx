import { Cell, CellState } from "elements/cell"
import * as React from "react"
import { Component } from "react"


interface GridCellData {
    block?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 10
const CELL_SIZE = 50

const TARGETS = [36, 24, 12, 18]

interface GridProps {
}

interface GridState {
    selectionStart?: { x: number, y: number }
    selectionEnd?: { x: number, y: number }

    gridCellData: GridCellData[][]

    /** Index of the current target. */
    targetIndex: number
    /** Currently built up amount towards the target. */
    value: number
    attempt: number

    score: number
}



export class Grid extends Component<GridProps, GridState> {
    state: GridState = {
        gridCellData: initializeGridData(GRID_WIDTH, GRID_HEIGHT),
        targetIndex: 0,
        value: 0,
        attempt: 0,
        score: 0,
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
        this.commitSelection()
        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
    }

    onOutsideUp() {
        this.commitSelection()
        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
    }

    commitSelection() {
        const s = this.getNormalizedSelection()
        if (!s) return

        if (!this.checkSelectionClean()) {
            return
        }

        // Calculate the added value.
        const selectionValue = (s.maxX - s.minX + 1) * (s.maxY - s.minY + 1)

        const target = TARGETS[this.state.targetIndex]
        const newValue = this.state.value + selectionValue

        // Exceeding the target is not allowed.
        if (newValue > target) return

        // Calculate the score.
        const multiplier = 4 * Math.pow(0.5, this.state.attempt)
        const scoreDelta = selectionValue * multiplier
        console.log("Score:", multiplier, scoreDelta)
        const newScore = this.state.score + scoreDelta

        // Mark the grid cell data.
        for (let x = s.minX; x <= s.maxX; x++) {
            for (let y = s.minY; y <= s.maxY; y++) {
                this.state.gridCellData[x][y].block = 1
            }
        }

        if (newValue == target) {
            // Target has been met. Advance target.
            this.setState({
                targetIndex: this.state.targetIndex + 1,
                value: 0,
                score: newScore,
                attempt: 0,
            })
        } else {
            this.setState({
                value: this.state.value + selectionValue,
                score: newScore,
                attempt: this.state.attempt + 1
            })
        }
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
        return "normal"
    }

    render() {
        let cells: React.ReactChild[] = []

        const isSelectionClean = this.checkSelectionClean()
        const s = this.getNormalizedSelection()

        let estimatedValue
        if (isSelectionClean && s) {
            estimatedValue = (s.maxX - s.minX + 1) * (s.maxY - s.minY + 1)
        } else {
            estimatedValue = 0
        }

        const target = TARGETS[this.state.targetIndex]
        const isSelectionTooLarge = this.state.value + estimatedValue > target

        const valueCssClass = estimatedValue == 0 ? "" : (isSelectionTooLarge ? "text-danger" : "text-success")

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                cells.push(<Cell
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    size={ CELL_SIZE }
                    state={ this.determineCellState(x, y, isSelectionClean && !isSelectionTooLarge) }
                    onMouseDown={ () => this.onCellDown(x, y) }
                    onMouseUp={ () => this.onCellUp(x, y) }
                    onMouseMove={ () => this.onCellMove(x, y) }
                />)
            }
        }

        return <div key="container" className="container" onMouseUp={ () => this.onOutsideUp()}>
            <div className="header">
                <div>Target: { TARGETS[this.state.targetIndex] }</div>
                <div className={valueCssClass}>Value: { this.state.value + estimatedValue }</div>
                <div>Score: { this.state.score }</div>
            </div>
            <div key="grid" className="grid">
                { cells }
            </div>
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
