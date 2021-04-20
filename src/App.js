import React, { Component, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MainComponents, ProductComponent } from "./components";
import "./stylesheet/global.scss";
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
              <Route exact path="/products" component={ProductComponent} />
            </Switch>
          </Router>
        </Suspense>
      </div>
    );
  }
}
export default App;
