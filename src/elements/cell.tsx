import * as React from "react"
import { Component } from "react"

export type CellState = "none" | "normal" | "selected" | "assigned" | "selected-error" | "selected-error-assigned" | "assigned-active"

interface CellProps {
    x: number,
    y: number,
    size: number,
    state: CellState,
    value?: number
}

interface State {

}

export class Cell extends Component<CellProps, State> {
    render() {
        // TODO: Touchmove needs work.
        const animatable = this.props.state != "selected" && this.props.state != "selected-error"
        const assigned = this.props.state == "assigned" || this.props.state == "selected-error-assigned"
        const assignedActive = this.props.state == "assigned-active"
        const hasValue = this.props.value
        return <div
            className={`cell ${animatable ? "animatable" : ""} ${assigned ? "assigned" : ""} ${assignedActive ? "assigned-active" : ""} ${hasValue ? "has-value" : ""}`}
            style={{
                width: this.props.size + 1,
                height: this.props.size + 1,
                left: this.props.x,
                top: this.props.y,
                background: colorForState(this.props.state)
            }}
        >{ this.props.value ?? "" }</div>
    }
}

function colorForState(state: CellState): string {
    switch (state) {
        case "normal": return "#aaaaaa"
        case "selected": return "#39b051"
        case "assigned": return "#888888"
        case "assigned-active": return "#4895de"
        case "selected-error": return "red"
        case "selected-error-assigned": return "red"
        case "none": return "transparent"
    }
}