import { Cell, CellState } from "elements/cell"
import { Instructions } from "elements/instructions"
import { NextLevelModal } from "elements/modals"
import { ScoreEffect } from "elements/score"
import { evaluateRating, LevelPack, LevelSpec } from "levels"
import * as React from "react"
import { Component } from "react"
import { XYSelection } from "types"
import "utils"
import { version } from "version"

const LEVEL_COMPLETE_TIMEOUT_MS = 16

const GRID_WIDTH = 10
const GRID_HEIGHT = 10
const CELL_SIZE = 35

type GridCellData =
    {
        /** Non-playable, out of bounds cell. */
        type: "null"
    } |
    {
        /** Empty, playable cell */
        type: "empty"
    } |
    {
        type: "assigned",
        block: number
    }

interface GridProps {
    levelPack: LevelPack
}

interface GridState {
    selectionStart?: { x: number, y: number }
    selectionEnd?: { x: number, y: number }

    gridCellData: GridCellData[][]

    /** Current level. */
    currentLevel: number
    isLevelFinished: boolean

    /** Index of the current target. */
    targetIndex: number
    /** Currently built up amount towards the target. */
    value: number
    attempt: number

    levelScore: number
    totalScore: number
    levelRating: number
}

export class Grid extends Component<GridProps, GridState> {
    private scoreEffectRef = React.createRef<ScoreEffect>();

    get currentLevel(): LevelSpec {
        return this.props.levelPack.levels[this.state.currentLevel]
    }

    constructor(props: GridProps) {
        super(props)
        this.state = {
            currentLevel: 0,
            gridCellData: this.createGridCellDataForLevel(0),
            targetIndex: 0,
            isLevelFinished: false,
            value: 0,
            attempt: 0,
            levelScore: 0,
            totalScore: 0,
            levelRating: 0,
        }
    }

    onCellDown(x: number, y: number) {
        if (this.state.gridCellData[x][y].type !== "empty") return

        this.setState({
            selectionStart: { x, y }
        })
    }

    onCellMove(x: number, y: number) {
        if (!this.state.selectionStart) return

        if (this.state.gridCellData[x][y].type !== "empty") return

        this.setState({
            selectionEnd: { x, y }
        })
    }

    onCellUp() {
        console.log("Cell Up")
        const s = this.getNormalizedSelection()

        this.commitSelection(s)
        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
        console.log("cel up finish", this.state.selectionStart)
    }

    onOutsideUp() {
        const s = this.getNormalizedSelection()
        // Bug: Outside up gets triggered on selections of size 1.
        // This would normally not need handling using outside up so we are going to skip.
        if (s && s.size > 1) {
            this.commitSelection(s)
        }

        this.setState({
            selectionStart: undefined,
            selectionEnd: undefined,
        })
    }

    commitSelection(s?: XYSelection) {
        if (!s) return

        if (!this.checkSelectionClean(s)) {
            return
        }

        // Calculate the added value.
        const selectionValue = s.size

        const target = this.currentLevel.targets[this.state.targetIndex]
        const newValue = this.state.value + selectionValue

        // Exceeding the target is not allowed.
        if (newValue > target) return

        // Calculate the score.
        const multiplier = Math.max(1, 4 - this.state.attempt)
        const rawScore = selectionValue
        const scoreDelta = Math.max(1, Math.ceil(rawScore * multiplier))

        // Bonuses.
        let bonus: { value: number, type: string } | undefined
        if (s.isSquare && s.size > 1) {
            bonus = { value: s.size, type: "SQUARE BONUS"}
        }

        // Calculate new score.
        const finalScoreDelta = scoreDelta + (bonus?.value ?? 0)
        const newLevelScore = this.state.levelScore + finalScoreDelta
        const newTotalScore = this.state.totalScore + finalScoreDelta

        // Mark the grid cell data.
        s.iterate((x, y) => this.state.gridCellData[x][y] = { type: "assigned", block: this.state.targetIndex })

        // Announce score.
        this.scoreEffectRef.current!.announce(rawScore, multiplier, bonus)

        if (newValue != target) {
            // Target not yet met.
            this.setState({
                value: this.state.value + selectionValue,
                attempt: this.state.attempt + 1,

                levelScore: newLevelScore,
                totalScore: newTotalScore,
            })
        } else if (this.state.targetIndex + 1 < this.currentLevel.targets.length) {
            // Target has been met. Advance target.
            this.setState({
                targetIndex: this.state.targetIndex + 1,
                value: 0,
                attempt: 0,
                levelScore: newLevelScore,
                totalScore: newTotalScore,
            })
        } else {
            // Level is now finished.
            this.setState({
                value: this.state.value + selectionValue,
                attempt: this.state.attempt + 1,

                levelScore: newLevelScore,
                totalScore: newTotalScore,
                levelRating: evaluateRating(newLevelScore, this.currentLevel.ratingBands)
            })
            setTimeout(() => this.setState({ isLevelFinished: true }), LEVEL_COMPLETE_TIMEOUT_MS)
        }
    }

    private advanceLevel() {
        this.setState({
            currentLevel: this.state.currentLevel + 1,
            gridCellData: this.createGridCellDataForLevel(this.state.currentLevel + 1),
            targetIndex: 0,
            value: 0,
            attempt: 0,
            isLevelFinished: false,

            levelScore: 0,
        })
    }

    private restartLevel() {
        this.setState({
            gridCellData: this.createGridCellDataForLevel(this.state.currentLevel),
            targetIndex: 0,
            value: 0,
            attempt: 0,
            isLevelFinished: false,

            levelScore: 0,
            totalScore: this.state.totalScore - this.state.levelScore
        })
    }

    private createGridCellDataForLevel(index: number): GridCellData[][] {
        let gridCellData = initializeGridData(GRID_WIDTH, GRID_HEIGHT)

        const levelSpec = this.props.levelPack.levels[index]

        for (const emptyCellsSpec of levelSpec.setup.emptyCells) {
            emptyCellsSpec.iterate((x, y) => { gridCellData[x][y].type = "empty" })
        }

        return gridCellData
    }

    private isInsideSelection(x: number, y: number): boolean {
        const s = this.getNormalizedSelection()
        if (!s) return false

        return s.contains(x, y)
    }

    /** Checks if the selection only contains unassigned cells. */
    private checkSelectionClean(s?: XYSelection): boolean {
        if (!s) return true

        for (let x = s.minX; x <= s.maxX; x++) {
            for (let y = s.minY; y <= s.maxY; y++) {
                const cellData = this.state.gridCellData[x][y]
                if (cellData.type !== "empty") return false
            }
        }

        return true
    }

    private getNormalizedSelection(): XYSelection | undefined {
        if (!this.state.selectionStart) return undefined
        if (!this.state.selectionEnd) {
            return XYSelection.range(this.state.selectionStart.x, this.state.selectionStart.y)
        }

        return XYSelection.startEnd(this.state.selectionStart, this.state.selectionEnd)
    }

    private determineCellState(x: number, y: number, isSelectionClean: boolean): CellState {
        const isSelected = this.isInsideSelection(x, y)

        const cell = this.state.gridCellData[x][y]

        const isNone = cell.type === "null"
        const isAssigned = cell.type === "assigned"
        const isCurrentTarget = cell.type === "assigned" && cell.block === this.state.targetIndex

        if (isSelected) {
            if (!isSelectionClean) {
                if (isAssigned) return "selected-error-assigned"
                return "selected-error"
            }
            return "selected"
        } else if (isAssigned) {
            if (isCurrentTarget) return "assigned-active"
            return "assigned"
        } else if (!isNone) {
            return "normal"
        }
        return "none"
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

        const s = this.getNormalizedSelection()
        const isSelectionClean = this.checkSelectionClean(s)

        const estimatedValue = (isSelectionClean && s) ? s.size : 0

        const target = this.currentLevel.targets[this.state.targetIndex]
        const isSelectionTooLarge = this.state.value + estimatedValue > target

        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const value = (x == this.state.selectionStart?.x && y == this.state.selectionStart.y)
                    ? estimatedValue
                    : undefined

                cells.push(<Cell
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    key={`${x}_${y}`}
                    size={ CELL_SIZE }
                    value={ value }
                    state={ this.determineCellState(x, y, isSelectionClean && !isSelectionTooLarge) }
                />)
            }
        }

        const targetIndex = this.state.targetIndex
        const totalTargets = this.currentLevel.targets.length
        const activeTarget = this.currentLevel.targets[this.state.targetIndex]
        const nextLevelAvailable = this.state.currentLevel + 1 < this.props.levelPack.levels.length

        /** The estimated total. */
        const pendingFinalValue = this.state.value + estimatedValue

        const targetCss =  this.state.value == 0 ? "blue" : (pendingFinalValue === activeTarget) ? "green" : ""
        const currentCss = estimatedValue == 0 && pendingFinalValue !== activeTarget
            ? (this.state.value == 0 ? "" : "blue")
            : (isSelectionTooLarge ? "red" : "green")

        return <div key="container" className="container" onMouseUp={ () => this.onOutsideUp()}>
            <div className="header">
                <div className="d-flex justify-content-between">
                    <div>
                        <h5>LEVEL SCORE</h5>
                        <h3 onClick={() => alert(version)}>{ this.state.levelScore.pad(4) }</h3>
                    </div>
                    <div className="text-right">
                        <h5>TOTAL SCORE</h5>
                        <h3 className="half-size">{ this.state.totalScore.pad(6) }</h3>
                    </div>
                </div>
                <div className="value-box">
                    <h5>Target {targetIndex + 1}/<span className="lighter">{totalTargets}</span></h5>
                    <h3 className={`animate-text ${targetCss}`}>{ this.currentLevel.targets[targetIndex] }</h3>
                </div>
                <div className="value-box">
                    <h5>Current</h5>
                    <h3 className={`animate-text ${currentCss}`}>{ pendingFinalValue }</h3>
                </div>
                <div className="value-box">
                    <h5>LVL</h5>
                    <h3>{ this.state.currentLevel + 1 }</h3>
                </div>
            </div>
            <div key="grid" className="grid"
                style={{width: CELL_SIZE * GRID_WIDTH + 2, height: CELL_SIZE * GRID_HEIGHT + 2 }}
                >
                { cells }
                <div key="interactor" className={"interactor " + (this.state.isLevelFinished ? "level-complete" : "")}
                    onMouseDown={(e) => {
                        this.onCellDown(...this.convertToCellCoords(e))
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    onMouseUp={(e) => this.onCellUp() }
                    onMouseMove={(e) => {
                        this.onCellMove(...this.convertToCellCoords(e))
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    onTouchStart={(e) => {
                        this.onCellDown(...this.convertTouchToCellCoords(e))
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    onTouchEnd={(e) => this.onCellUp() }
                    onTouchMove={(e) => {
                        this.onCellMove(...this.convertTouchToCellCoords(e))
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    />

                <div className="score-effect-wrapper">
                    <ScoreEffect ref={this.scoreEffectRef} />
                </div>
            </div>
            <div className="mt-1">
                <button onClick={() => this.restartLevel()}>Restart Level</button>
                { nextLevelAvailable ? <button onClick={() => this.advanceLevel()}>Skip Level</button> : null }
            </div>
            <Instructions />
            <NextLevelModal
                show={this.state.isLevelFinished}
                score={this.state.levelScore}
                rating={this.state.levelRating}
                onRestartLevel={() => this.restartLevel() }
                onNextLevel={() => this.advanceLevel() }
                nextLevelAvailable={ nextLevelAvailable }
                />
        </div>
    }
}

function initializeGridData(width: number, height: number): GridCellData[][] {
    let data: GridCellData[][] = []
    for (let x = 0; x < width; x++) {
        let column: GridCellData[] = []
        for (let y = 0; y < height; y++) {
            column.push({ type: "null" })
        }
        data.push(column)
    }
    return data
}
