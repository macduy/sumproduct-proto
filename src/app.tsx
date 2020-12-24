import { Grid } from "elements/grid"
import { BASE_LEVELS } from "levels/base"
import * as React from "react"
import { Component } from "react"
import { version } from "version"

import "../styles/styles.less"

interface AppProps {
}

interface AppState {
}

export class App extends Component<AppProps, AppState> {
    render() {
        return <div>
            <Grid levelPack={BASE_LEVELS} />
            <div className="version">{ version }</div>
        </div>
    }
}