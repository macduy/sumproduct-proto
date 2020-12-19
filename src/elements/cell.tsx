import * as React from "react"
import { Component } from "react"

export type CellState = "normal" | "selected" | "assigned" | "selected-error"

interface CellProps {
    x: number,
    y: number,
    size: number,
    state: CellState,

    onMouseDown: () => void
    onMouseMove: () => void
    onMouseUp: () => void
}

interface State {

}

export class Cell extends Component<CellProps, State> {
    render() {
        // TODO: Touchmove needs work.
        return <div
            className="cell"
            style={{
                width: this.props.size,
                height: this.props.size,
                left: this.props.x,
                top: this.props.y,
                background: colorForState(this.props.state)
            }}
            onMouseDown={() => this.props.onMouseDown()}
            onMouseMove={() => this.props.onMouseMove()}
            onMouseUp={() => this.props.onMouseUp()}
            onTouchStart={(e) => this.props.onMouseDown()}
            onTouchMove={(e) => this.props.onMouseMove()}
            onTouchEnd={(e) => this.props.onMouseUp()}
        >

        </div>
    }
}

function colorForState(state: CellState): string {
    switch (state) {
        case "normal": return "gray"
        case "selected": return "green"
        case "assigned": return "blue"
        case "selected-error": return "red"
    }
}