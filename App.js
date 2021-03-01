import React, { Component } from 'react';
import Route from "./src/route"
import STORE from "./src/Store/index"
import { Provider } from 'mobx-react';
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Provider {...STORE}>
      <Route/>
      </Provider>
    );
  }
}
