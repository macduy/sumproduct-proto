import * as React from "react"

export const NextLevelModal = (props: { show: boolean, onNextLevel: () => void }) => {
    const css = props.show ? "show" : ""

    return <div className={`next-level-modal ${css}`}>
        <button onClick={props.onNextLevel}>Next Level</button>
    </div>
}