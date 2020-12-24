import * as React from "react"

interface Props {
    show: boolean,
    onNextLevel: () => void
    onRestartLevel: () => void
    score: number
    rating: number
    nextLevelAvailable: boolean
    totalScore: number
    perLevelScores: { levels: number, scores: {[index: number]: { score: number, rating: number }}}
}

export const NextLevelModal = (props: Props) => {
    const css = props.show ? "show" : ""

    return <div className={`next-level-modal ${css} text-center`}>
        <h4 className="yellow">Level complete!</h4>
        <div>Score: {props.score}</div>
        <div className="star-rating h2"><StarRating stars={props.rating} /></div>
        <br/>
        <button onClick={props.onRestartLevel}><i className="fas fa-undo fa-fw mr-1" /> Restart</button>
        {
            props.nextLevelAvailable
            ? <button onClick={props.onNextLevel}><i className="fas fa-fast-forward fa-fw mr-1" />Next</button>
            : <div className="mt-2">
                Congratulations, you completed the game with a final score of <br/>
                <h2 className="yellow display-4">{ props.totalScore }</h2>
                <div className="text-muted" data-toggle="collapse" data-target="#score-table">Show scores</div>
                <LevelScoreTable {...props.perLevelScores } />
            </div>
        }
    </div>
}

const StarRating = (props: { stars: number }) => {
    let ratingStars: React.ReactChild[] = []
    for (let i = 0; i < props.stars; i++) {
        ratingStars.push(<i className="fas fa-star filled" />)
    }
    for (let i = props.stars; i < 3; i++) {
        ratingStars.push(<i className="fas fa-star" />)
    }
    return <>{ ratingStars}</>
}

const LevelScoreTable = (props: Props["perLevelScores"]) => {
    let rows: React.ReactChild[] = []
    for (let i = 0; i < props.levels; i++) {
        let score = props.scores[i]
        if (score) {
            rows.push(<tr>
                <td>Lvl {i + 1}</td>
                <td>{ score.score }</td>
                <td className="star-rating"><StarRating stars={ score.rating }/></td>
            </tr>)
        } else {
            rows.push(<tr>
                <td>Lvl {i + 1}</td>
                <td>0</td>
                <td className="star-rating"><StarRating stars={ 0 }/></td>
            </tr>)
        }
    }

    return <table className="collapse w-75" id="score-table">
        { rows }
    </table>
}