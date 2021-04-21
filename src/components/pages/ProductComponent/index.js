import React, { Component } from "react";
import { List, Avatar } from "antd";

import { httpClient } from "../../../utils/HttpClient";

export default class ProductComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      selectData: [],
      total: 0,
    };
  }

  componentDidMount = () => {
    httpClient
      .get("/product-list")
      .then((response) => {
        if (response !== undefined) {
          this.setState({
            data: [
              {
                id: "MhJuPxDxvq44fSrJdj3Y",
                product_img:
                  "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/dream-catchers.jpg?alt=media",
                product_name: "ตาข่ายดักฝันรุ่น 4",
                product_price: 8,
              },
              {
                id: "Zj9XWpq7hbdgQfcFTFMG",
                product_img:
                  "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/watercolor-dreamcatcher-with-flowers_45050-130.jpg?alt=media",
                product_name: "ตาข่ายดักฝันรุ่น 1",
                product_price: 5,
              },
              {
                id: "bMevqEVRYxYNa31tqV4D",
                product_img:
                  "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/b6b7c0478ba187e57082991f2ba3ca01.png?alt=media",
                product_name: "ตาข่ายดักฝันรุ่น 2",
                product_price: 6,
              },
              {
                id: "xQCs8GBiW7pZvNpILwUD",
                product_img:
                  "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/71brAT3N3sL._AC_SL1500_.jpg?alt=media",
                product_name: "ตาข่ายดักฝันรุ่น 3",
                product_price: 7,
              },
            ],
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  selectProduct = async (doc) => {
    const { data } = this.state;
    let total = 0;
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].id !== doc.id) {
        result.push(data[i]);
      }
    }
    await this.setState({
      selectData: this.state.selectData.concat(doc),
      data: result,
    });

    await this.state.selectData.forEach((doc) => {
      total = total + doc.product_price;
    });
    await this.setState({
      total,
    });
  };

  unSelectProduct = async (doc) => {
    const { selectData } = this.state;
    let total = 0;
    let result = [];
    for (let i = 0; i < selectData.length; i++) {
      if (selectData[i].id !== doc.id) {
        result.push(selectData[i]);
      }
    }
    await this.setState({
      data: this.state.data.concat(doc),
      selectData: result,
    });
    await this.state.selectData.forEach((doc) => {
      total = total + doc.product_price;
    });
    await this.setState({
      total,
    });
  };

  render() {
    const { data, selectData, total } = this.state;
    console.log(data);
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
                description={`ราคา ${item.product_price} บาท`}
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
                description={`ราคา ${item.product_price} บาท`}
              />
            </List.Item>
          )}
        />
        <h2>ราคารวม {total} บาท</h2>
      </div>
    );
  }
}
