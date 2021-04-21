module.exports = {
  checkout: (doc) => {
    return {
      type: "flex",
      altText: "รายการสั่งซื้อของคุณ",
      contents: {
        type: "bubble",
        size: "giga",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "image",
                  url:
                    "https://firebasestorage.googleapis.com/v0/b/linedeveloper-63341.appspot.com/o/180x180.png?alt=media&token=73c8ea72-b89d-4aa9-8ca8-7fda3dc4005c",
                },
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: "Dreamcatcher Store",
                      wrap: true,
                      size: "xl",
                    },
                    {
                      type: "text",
                      text: "รายการสินค้า",
                    },
                  ],
                  paddingTop: "20px",
                },
              ],
            },
            {
              type: "separator",
              margin: "lg",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "1) ตาข่ายดักฝันรุ่นที่ 1",
                      size: "lg",
                      color: "#6e5dde",
                    },
                    {
                      type: "image",
                      url:
                        "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/b6b7c0478ba187e57082991f2ba3ca01.png?alt=media",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "จำนวน: 1 ชิ้น",
                    },
                    {
                      type: "text",
                      text: "ราคาต่อชิ้น: 150 ฿",
                      align: "end",
                    },
                  ],
                  margin: "sm",
                },
                {
                  type: "text",
                  text: "รวม: 150 ฿",
                  align: "end",
                  size: "lg",
                  color: "#fc97a2",
                },
              ],
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingStart: "10px",
              paddingEnd: "10px",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "2) ตาข่ายดักฝันรุ่น 2",
                      size: "lg",
                      color: "#6e5dde",
                    },
                    {
                      type: "image",
                      url:
                        "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/watercolor-dreamcatcher-with-flowers_45050-130.jpg?alt=media",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "จำนวน: 1 ชิ้น",
                    },
                    {
                      type: "text",
                      text: "ราคาต่อชิ้น: 100 ฿",
                      align: "end",
                    },
                  ],
                  margin: "sm",
                },
                {
                  type: "text",
                  text: "รวม: 100 ฿",
                  align: "end",
                  size: "lg",
                  color: "#fc97a2",
                },
              ],
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingStart: "10px",
              paddingEnd: "10px",
            },
            {
              type: "separator",
              margin: "lg",
            },
            {
              type: "text",
              text: "ราคารวม: 250 ฿",
              align: "end",
              size: "xxl",
              color: "#FF0000",
              margin: "md",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              action: {
                type: "postback",
                label: "ชำระด้วย Rabbit LINE Pay",
                data: "pay",
              },
              style: "primary",
            },
          ],
        },
      },
    };
  },
  startpay: (url) => {
    return {
      type: "flex",
      altText: "Flex Message",
      contents: {
        type: "bubble",
        direction: "ltr",
        body: {
          type: "box",
          layout: "vertical",
          margin: "lg",
          contents: [
            {
              type: "text",
              text: "กดที่ปุ่มนี่เพื่อเริ่มการชำระเงินด้วย Rabbit LINE Pay",
              size: "lg",
              wrap: true,
            },
            {
              type: "button",
              action: {
                type: "uri",
                label: "แตะที่นี่เพื่อเริ่ม",
                uri: url,
              },
              margin: "md",
              style: "primary",
            },
          ],
        },
      },
    };
  },
  receipts: (doc) => {
    let contents = [];
    const productData = doc.packages[0].products;
    for (let index = 0; index < productData.length; index++) {
      contents.push({
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: productData.name,
            size: "sm",
            color: "#555555",
            flex: 0,
          },
          {
            type: "text",
            text: productData.price + " ฿",
            size: "sm",
            color: "#111111",
            align: "end",
          },
        ],
      });
    }
    contents.push(
      {
        type: "separator",
        margin: "xxl",
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "xxl",
        contents: [
          {
            type: "text",
            text: "ITEMS",
            size: "sm",
            color: "#555555",
          },
          {
            type: "text",
            text: doc.packages[0].products.length,
            size: "sm",
            color: "#111111",
            align: "end",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: "TOTAL",
            size: "sm",
            color: "#555555",
          },
          {
            type: "text",
            text: doc.amount + " ฿",
            size: "sm",
            color: "#111111",
            align: "end",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: "LINE Pay",
            size: "sm",
            color: "#555555",
          },
          {
            type: "text",
            text: doc.amount + " ฿",
            size: "sm",
            color: "#111111",
            align: "end",
          },
        ],
      },
      {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: "CHANGE",
            size: "sm",
            color: "#555555",
          },
          {
            type: "text",
            text: "-",
            size: "sm",
            color: "#111111",
            align: "end",
          },
        ],
      }
    );
    return {
      type: "flex",
      altText: "Receipt",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "RECEIPT",
              weight: "bold",
              color: "#1DB446",
              size: "sm",
            },
            {
              type: "text",
              text: "Dreamcatcher Store",
              weight: "bold",
              size: "xxl",
              margin: "md",
            },
            {
              type: "separator",
              margin: "xxl",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "xxl",
              spacing: "sm",
              contents: contents,
            },
            {
              type: "separator",
              margin: "xxl",
            },
          ],
        },
        styles: {
          footer: {
            separator: true,
          },
        },
      },
    };
  },
  receipt: () => {
    return {
      type: "flex",
      altText: "Receipt",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "RECEIPT",
              weight: "bold",
              color: "#1DB446",
              size: "sm",
            },
            {
              type: "text",
              text: "Dreamcatcher Store",
              weight: "bold",
              size: "xxl",
              margin: "md",
            },
            {
              type: "separator",
              margin: "xxl",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "xxl",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "ตาข่ายดักฝันรุ่นที่ 2",
                      size: "sm",
                      color: "#555555",
                      flex: 0,
                    },
                    {
                      type: "text",
                      text: "150 ฿",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "ตาข่ายดักฝันรุ่น 1",
                      size: "sm",
                      color: "#555555",
                      flex: 0,
                    },
                    {
                      type: "text",
                      text: "100 ฿",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
                {
                  type: "separator",
                  margin: "xxl",
                },
                {
                  type: "box",
                  layout: "horizontal",
                  margin: "xxl",
                  contents: [
                    {
                      type: "text",
                      text: "ITEMS",
                      size: "sm",
                      color: "#555555",
                    },
                    {
                      type: "text",
                      text: "2",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "TOTAL",
                      size: "sm",
                      color: "#555555",
                    },
                    {
                      type: "text",
                      text: "250 ฿",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "LINE Pay",
                      size: "sm",
                      color: "#555555",
                    },
                    {
                      type: "text",
                      text: "250 ฿",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
                {
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: "CHANGE",
                      size: "sm",
                      color: "#555555",
                    },
                    {
                      type: "text",
                      text: "-",
                      size: "sm",
                      color: "#111111",
                      align: "end",
                    },
                  ],
                },
              ],
            },
            {
              type: "separator",
              margin: "xxl",
            },
          ],
        },
        styles: {
          footer: {
            separator: true,
          },
        },
      },
    };
  },
};
