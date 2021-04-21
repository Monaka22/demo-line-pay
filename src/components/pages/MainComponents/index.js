import React, { Component } from "react";
import { Button } from "antd";

const liff = window.liff;

export default class MainComponent extends Component {
  componentDidMount = async () => {
    await liff.init({ liffId: `${process.env.REACT_APP_LINE_ID}`  });
    if (liff.isLoggedIn()) {
      let getProfile = await liff.getProfile();
      let data = Object.assign({
        userId: getProfile.userId,
        imageUrl: getProfile.pictureUrl,
        token: liff.getAccessToken(),
      });
      localStorage.setItem("userData", JSON.stringify(data));
      localStorage.setItem("token", liff.getAccessToken());
    } else {
      liff.login();
    }
  };
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
