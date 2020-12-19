import * as React from "react"
import { Component } from "react"

export type CellState = "normal" | "selected" | "assigned" | "selected-error" | "selected-error-assigned"

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
        const assigned = this.props.state == "assigned" || this.props.state == "selected-error-assigned"
        return <div
            className={`cell ${animatable ? "animatable" : ""} ${assigned ? "assigned" : ""}`}
            style={{
                width: this.props.size + 1,
                height: this.props.size + 1,
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
        case "normal": return "#aaaaaa"
        case "selected": return "#4895de"
        case "assigned": return "#39b051"
        case "selected-error": return "red"
        case "selected-error-assigned": return "red"
    }
}