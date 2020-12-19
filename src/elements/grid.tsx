import { Cell, CellState } from "elements/cell"
import * as React from "react"
import { Component } from "react"


interface GridCellData {
    block?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 10
const CELL_SIZE = 35

const TARGETS = [36, 29, 12, 18]

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
        if (!this.state.selectionStart) return

        this.setState({
            selectionEnd: { x, y }
        })
    }

    onCellUp() {
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
        const multiplier = 8 * Math.pow(0.5, this.state.attempt)
        const scoreDelta = Math.max(1, selectionValue * multiplier)
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
                if (isAssigned) return "selected-error-assigned"
                return "selected-error"
            }
            return "selected"
        } else if (isAssigned) {
            return "assigned"
        }
        return "normal"
    }

    private clampX(x: number): number {
        if (x >= GRID_WIDTH) return GRID_WIDTH - 1
        if (x < 0) return 0
        return x
    }

    private clampY(y: number): number {
        if (y >= GRID_HEIGHT) return GRID_HEIGHT - 1
        if (y < 0) return 0
        return y
    }

    private convertToCellCoords(e: React.MouseEvent): [number, number] {
        return [
            this.clampX(Math.floor(e.nativeEvent.offsetX / CELL_SIZE)),
            this.clampY(Math.floor(e.nativeEvent.offsetY / CELL_SIZE)),
        ]
    }

    private convertTouchToCellCoords(e: React.TouchEvent): [number, number] {
        const rect = (e.nativeEvent.target as any).getBoundingClientRect()
        const offsetX = e.touches[0].pageX - rect.left
        const offsetY = e.touches[0].pageY - rect.top
        return [
            this.clampX(Math.floor(offsetX / CELL_SIZE)),
            this.clampY(Math.floor(offsetY / CELL_SIZE)),
        ]
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
                    key={`${x}_${y}`}
                    size={ CELL_SIZE }
                    state={ this.determineCellState(x, y, isSelectionClean && !isSelectionTooLarge) }
                />)
            }
        }

        return <div key="container" className="container" onMouseUp={ () => this.onOutsideUp()}>
            <div className="header">
                <div className="value-box">
                    <h5>Target</h5>
                    <h3>{ TARGETS[this.state.targetIndex] }</h3>
                </div>
                <div className="value-box">
                    <h5>Value</h5>
                    <h3 className={valueCssClass}>{ this.state.value + estimatedValue }</h3>
                </div>
                <div className="value-box">
                    <h5>Score</h5>
                    <h3>{ this.state.score }</h3>
                </div>


            </div>
            <div key="grid" className="grid"
                style={{width: CELL_SIZE * GRID_WIDTH, height: CELL_SIZE * GRID_HEIGHT }}
                >
                { cells }
                <div key="interactor" className="interactor"
                    onMouseDown={(e) => this.onCellDown(...this.convertToCellCoords(e)) }
                    onMouseUp={(e) => this.onCellUp() }
                    onMouseMove={(e) => this.onCellMove(...this.convertToCellCoords(e)) }
                    onTouchStart={(e) => this.onCellDown(...this.convertTouchToCellCoords(e)) }
                    onTouchEnd={(e) => this.onCellUp() }
                    onTouchMove={(e) => this.onCellMove(...this.convertTouchToCellCoords(e)) }

                    />
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
