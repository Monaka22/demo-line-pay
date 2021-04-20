import React, { Component } from "react";
import { Button } from "antd";

export default class MainComponent extends Component {
  render() {
    return (
      <div style={{ marginTop: 20 }}>
        <Button
          type="primary"
          block
          size="large"
          onClick={() => this.props.history.push("/products")}
        >
          Shopping
        </Button>
        <Button style={{ marginTop: 20 }} block type="link">
          History
        </Button>
      </div>
    );
  }
}
