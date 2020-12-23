import * as React from "react"

interface Props {
    show: boolean,
    onNextLevel: () => void
    onRestartLevel: () => void
    score: number
    rating: number
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

    return <div className={`next-level-modal ${css}`}>
        Level complete!
        <div>Score: {props.score}</div>
        <div className="star-rating">{ ratingStars }</div>
        <button onClick={props.onRestartLevel}>Restart Level</button>
        <button onClick={props.onNextLevel}>Next Level</button>
    </div>
}