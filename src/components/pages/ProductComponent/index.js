import React, { Component } from "react";
import { List, Avatar } from "antd";

import { httpClient } from "../../../utils/HttpClient";

export default class ProductComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      selectData: [],
      total: 0
    };
  }

  componentDidMount = () => {
    httpClient
      .get("/product-list")
      .then((response) => {
        if (response !== undefined) {
          this.setState({
            data: response.data.data,
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  selectProduct = (doc) => {
    const { data } = this.state;
    let total = 0
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].id !== doc.id) {
        result.push(data[i]);
      }
    }
    for (let index = 0; index < this.state.data.length; index++) {
        total = total + this.state.data[0].prooduct_price
    }
    this.setState({
      selectData: this.state.selectData.concat(doc),
      data: result,
      total
    });
  };

  unSelectProduct = (doc) => {
    const { selectData } = this.state;
    let total = 0
    let result = [];
    for (let i = 0; i < selectData.length; i++) {
      if (selectData[i].id !== doc.id) {
        result.push(selectData[i]);
      }
    }
    for (let index = 0; index < this.state.data.length; index++) {
        total = total + this.state.data[0].prooduct_price
    }
    this.setState({
      data: this.state.data.concat(doc),
      selectData: result,
      total
    });
  };

  render() {
    const { data, selectData, total } = this.state;
    return (
      <div style={{ padding: 20 }}>
        <h1>รายการสินค้า</h1>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              onClick={() => this.selectProduct(item)}
              style={{ border: "1px solid #ccc!important" }}
            >
              <List.Item.Meta
                avatar={<Avatar shape="square" src={item.product_img} />}
                title={<span>{item.product_name}</span>}
                description={`ราคา ${item.prooduct_price} บาท`}
              />
            </List.Item>
          )}
        />
        <h1 style={{ marginTop: 20 }}>ตระกร้าสินค้า</h1>
        <List
          itemLayout="horizontal"
          dataSource={selectData}
          renderItem={(item) => (
            <List.Item style={{ border: "1px solid #ccc!important" }}>
              <List.Item.Meta
                onClick={() => this.unSelectProduct(item)}
                avatar={<Avatar shape="square" src={item.product_img} />}
                title={<span>{item.product_name}</span>}
                description={`ราคา ${item.prooduct_price} บาท`}
              />
            </List.Item>
          )}
        />
        <h2>ราคารวม {total} บาท</h2>
      </div>
    );
  }
}
