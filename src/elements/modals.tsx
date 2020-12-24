import * as React from "react"

interface Props {
    show: boolean,
    onNextLevel: () => void
    onRestartLevel: () => void
    score: number
    rating: number
    nextLevelAvailable: boolean
}

export const NextLevelModal = (props: Props) => {
    const css = props.show ? "show" : ""
    let ratingStars: React.ReactChild[] = []
    for (let i = 0; i < props.rating; i++) {
        ratingStars.push(<i className="fas fa-star filled" />)
    }
    for (let i = props.rating; i < 3; i++) {
        ratingStars.push(<i className="fas fa-star" />)
    }

    return <div className={`next-level-modal ${css} text-center`}>
        <h4>Level complete!</h4>
        <div>Score: {props.score}</div>
        <div className="star-rating">{ ratingStars }</div>
        <br/>
        <button onClick={props.onRestartLevel}>Restart Level</button>
        { props.nextLevelAvailable ? <button onClick={props.onNextLevel}>Next Level</button> : null }
    </div>
}
