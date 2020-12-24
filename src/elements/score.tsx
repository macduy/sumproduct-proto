import * as React from "react"

interface Props {

}

interface State {
    state: "on" | "off"
    score: number,
    multiplier: number,
    bonus?: {
        value: number,
        type: string
    },
}

const EFFECT_VISIBLE_MS = 32

export class ScoreEffect extends React.Component<Props, State> {
    state: State = {
        state: "off",
        score: 0,
        multiplier: 0,
    }

    announce(score: number, multiplier: number = 1, bonus?: { value: number, type: string }) {
        this.setState({
            state: "on",
            score,
            multiplier,
            bonus,
        })
        setTimeout(() => this.setState({
            state: "off"
        }), EFFECT_VISIBLE_MS)
    }

    render() {
        const css = this.state.state === "off" ? "animate-out" : ""
        return <div className={`score-effect ${css}`}>
            <div className="score">+{ this.state.score} POINTS</div>
            { this.state.multiplier > 1 ? <div className="multiplier">&times;{ this.state.multiplier } MULTIPLIER</div> : undefined }
            { this.state.bonus ? <div className="bonus">+{ this.state.bonus.value } { this.state.bonus.type }</div> : undefined }
        </div>
    }
}

export const CurrentValueHighlighter = (props: { x: number, y: number, value: number, visible: boolean}) =>
    <div className="highlighter" style={{top: props.y, left: props.x, visibility: props.visible ? "visible" : "hidden" }}>
        { props.value }
    </div>