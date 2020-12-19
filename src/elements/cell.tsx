import * as React from "react"
import { Component } from "react"

export type CellState = "normal" | "selected" | "assigned" | "selected-error"

interface CellProps {
    x: number,
    y: number,
    size: number,
    state: CellState,
}

interface State {

}

export class Cell extends Component<CellProps, State> {
    render() {
        // TODO: Touchmove needs work.
        const animatable = this.props.state != "selected" && this.props.state != "selected-error"
        const assigned = this.props.state == "assigned"
        return <div
            className={`cell ${animatable ? "animatable" : ""} ${assigned ? "assigned" : ""}`}
            style={{
                width: this.props.size,
                height: this.props.size,
                left: this.props.x,
                top: this.props.y,
                background: colorForState(this.props.state)
            }}
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