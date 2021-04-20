import React, { Component, Suspense } from "react";
import { BrowserRouter as Router , Route, Switch } from "react-router-dom";
import { MainComponents } from "./components";
class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
    };
  }
  render() {
    return (
      <div>
        <Suspense fallback={null}>
          <Router>
            <Switch>
              <Route exact path="/" component={MainComponents} />
              <Route exact path="/products" component={MainComponents} />
            </Switch>
          </Router>
        </Suspense>
      </div>
    );
  }
}
export default App;
