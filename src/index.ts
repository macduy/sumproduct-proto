import { App } from "app"
import * as React from "react";
import * as ReactDOM from "react-dom";

function main() {
    const app = React.createElement(App)
    ReactDOM.render(app, document.getElementById("app"))
}

// Bind to on Ready
function ready(fn: () => void) {
    if (document.readyState != 'loading'){
      fn()
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(main)