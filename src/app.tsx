import { Grid } from "elements/grid"
import * as React from "react"
import { Component } from "react"

import "../styles/styles.less"

interface AppProps {
}

interface AppState {
}

export class App extends Component<AppProps, AppState> {
    render() {
        return <div>
            <Grid />
        </div>
    }
}