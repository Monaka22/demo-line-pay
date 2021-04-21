const functions = require("firebase-functions");
const request = require("request-promise");
const admin = require("firebase-admin");
const lah = require("lineapihelper");
const bodyParser = require("body-parser");
const express = require("express");

const UUID = require("uuid-v4");
const crypto = require("crypto");

const payloadcreator = require("./payload");

admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const app = express();
app.use(require("cors")({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const channelSecret = "473bcec0c36a1d0f4cc2dd08a9f1a1e2";
const channelId = "1655872733";
const baseUrl = "https://sandbox-api-pay.line.me";
const nonce = UUID();
lah.cat(
  "ygJ0/J3NIzpGokv7Ah1K6rOxluQWoenQnHp4QwkEcXbQaBBVgLuhA6yXp/R4MCMRN3WTTwJceJiUddPoTastVgRELZ64jcOEZElt3jo//VBd787MA1G8mPkOob0q5lXjjjNt/9XD0U4cbB0dbLud2AdB04t89/1O/w1cDnyilFU="
);

const genHeader = (ChannelID, ChannelSecret, URI, RequestDetail, nonce) => {
  if (typeof RequestDetail !== "string") {
    RequestDetail = JSON.stringify(RequestDetail);
  }
  const data = ChannelSecret + URI + RequestDetail + nonce;
  const signature = crypto
    .createHmac("SHA256", ChannelSecret)
    .update(data)
    .digest("base64")
    .toString();
  return {
    "Content-Type": "application/json",
    "X-LINE-ChannelId": ChannelID,
    "X-LINE-Authorization-Nonce": nonce,
    "X-LINE-Authorization": signature,
  };
};

exports.webhook = functions.region("asia-east2").https.onRequest((req, res) => {
  lah.setrequest(req);
  var payload = [];
  if (lah.eventtype() === "postback") {
    const pathUrl = "/v3/payments/request";
    const body = {
      amount: 250,
      currency: "THB",
      orderId: nonce,
      packages: [
        {
          id: nonce,
          amount: 250,
          name: "Dreamcatcher Package",
          products: [
            {
              name: "ตาข่ายดักฝันรุ่น 1",
              quantity: 1,
              price: 100,
              imageUrl:
                "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/watercolor-dreamcatcher-with-flowers_45050-130.jpg?alt=media",
            },
            {
              name: "ตาข่ายดักฝันรุ่นที่ 2",
              quantity: 1,
              price: 150,
              imageUrl:
                "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/b6b7c0478ba187e57082991f2ba3ca01.png?alt=media",
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl:
          "https://dd75340d5ef5.ngrok.io/dowho-line-pay/asia-east2/confirmOrder?userID=" +
          lah.userId(),
        cancelUrl:
          "https://dd75340d5ef5.ngrok.io/dowho-line-pay/asia-east2/confirmOrder",
      },
    };
    var header = genHeader(channelId, channelSecret, pathUrl, body, nonce);
    console.log(header);
    return request({
      method: `POST`,
      uri: `${baseUrl}${pathUrl}`,
      headers: header,
      body: JSON.stringify(body),
    })
      .then((data) => {
        console.log("data===>", data);
        var jsonparse = JSON.parse(data);
        var paymentUrl = jsonparse.info.paymentUrl.web;
        payload = [payloadcreator.startpay(paymentUrl)];
        return lah.reply(lah.replyToken(), payload);
      })
      .then(() => {
        return res.send();
      })
      .catch((e) => {
        console.log(e);
        return res.send("Done");
      });
  } else {
    if (lah.message().text === "Checkout") {
      payload = [
        {
          type: "text",
          text:
            "นี่คือรายการสั่งซื้อของคุณ หากรายการถูกต้องกรุณาชำระเงินด้วย Rabbit LINE Pay",
        },
        payloadcreator.checkout(),
      ];
    } else {
      payload = [
        {
          type: "text",
          text: "ไม่เข้าใจครับบ",
        },
      ];
    }
    lah
      .reply(lah.replyToken(), payload)
      .then((data) => {
        console.log(data);
        res.status(200).send();
      })
      .catch((e) => {
        console.log(e);
        res.status(200).send();
      });
  }
});

exports.confirmOrder = functions.https.onRequest((req, res) => {
  console.log(req.query.transactionId);
  if (typeof req.query.userID === "undefined") {
    return res.send("You cancled the payment");
  } else {
    const transactionId = req.query.transactionId;
    const userId = req.query.userID;
    var pathUrl = `/v3/payments/${transactionId}/confirm`;
    var body = {
      amount: 250,
      currency: "THB",
    };
    var header = genHeader(channelId, channelSecret, pathUrl, body, nonce);
    return request({
      uri: `${baseUrl}${pathUrl}`,
      method: "POST",
      headers: header,
      body: JSON.stringify(body),
    })
      .then((data) => {
        var jsondata = JSON.parse(data);
        if (jsondata.returnCode === "0000") {
          var payload = [
            {
              type: "text",
              text:
                "การชำระเงินเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ Dreamcatcher Store",
            },
            payloadcreator.receipt(),
          ];
          return lah.push(userId, payload);
        } else {
          const payload = [
            {
              type: "text",
              text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้",
            },
            {
              type: "text",
              text: jsondata.returnMessage,
            },
          ];
          return lah.push(userId, payload);
        }
      })
      .then((data) => {
        return res.send(
          "Successfully to get the data from LINE Pay,Please return to LINE App to see the payment result"
        );
      })
      .catch((e) => {
        var payload = [
          {
            type: "text",
            text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้",
          },
          {
            type: "text",
            text: e,
          },
        ];
        return lah.push(userId, payload);
      });
  }
});

app.post("/confirm-order", async function (req, res) {
  if (typeof req.body.userID === "undefined") {
    return res.send("You cancled the payment");
  } else {
    const transactionId = req.body.transactionId;
    const userId = req.body.userID;
    var pathUrl = `/v3/payments/${transactionId}/confirm`;
    var body = {
      amount: req.body.amount,
      currency: "THB",
    };
    var header = genHeader(channelId, channelSecret, pathUrl, body, nonce);
    return request({
      uri: `${baseUrl}${pathUrl}`,
      method: "POST",
      headers: header,
      body: JSON.stringify(body),
    })
      .then((data) => {
        console.log("data=>", {
          uri: `${baseUrl}${pathUrl}`,
          method: "POST",
          headers: header,
          body: JSON.stringify(body),
        });
        var jsondata = JSON.parse(data);
        if (jsondata.returnCode === "0000") {
          var payload = [
            {
              type: "text",
              text:
                "การชำระเงินเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ Dreamcatcher Store",
            },
            payloadcreator.receipt(data[0]),
          ];
          return lah.push(userId, payload);
        } else {
          var payload = [
            {
              type: "text",
              text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้",
            },
            {
              type: "text",
              text: jsondata.returnMessage,
            },
          ];
          return lah.push(userId, payload);
        }
      })
      .then((data) => {
        return res.send(
          "Successfully to get the data from LINE Pay,Please return to LINE App to see the payment result"
        );
      })
      .catch((e) => {
        var payload = [
          {
            type: "text",
            text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้",
          },
          {
            type: "text",
            text: e,
          },
        ];
        return lah.push(userId, payload);
      });
  }
});

app.get("/product-list", async function (req, res) {
  const data = [];
  await db
    .collection("products")
    .get()
    .then(async (snapshot) => {
      snapshot.forEach(async (doc) => {
        await data.push(Object.assign({ id: doc.id }, doc.data()));
      });
      await res.status(200).json({
        recordsTotal: data.length,
        recordsFiltered: data.length,
        data: data,
      });
      await res.end();
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
});

app.post("/create-order", async function (req, res) {
  let array = req.data.products;
  let content = [
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
  ];
  for (let index = 0; index < array.length; index++) {
    content.push({
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "1) " + array[index].product_name,
              size: "lg",
              color: "#6e5dde",
            },
            {
              type: "image",
              url: array[index].product_img,
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
              text: `ราคาต่อชิ้น: ${array[index].product_price} ฿`,
              align: "end",
            },
          ],
          margin: "sm",
        },
        {
          type: "text",
          text: `รวม: ${array[index].product_price} ฿`,
          align: "end",
          size: "lg",
          color: "#fc97a2",
        },
      ],
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingStart: "10px",
      paddingEnd: "10px",
    });
  }
  content.push({
    type: "separator",
    margin: "lg",
  });
  content.push({
    type: "text",
    text: `ราคารวม: ${req.body.amount} ฿`,
    align: "end",
    size: "xxl",
    color: "#FF0000",
    margin: "md",
  });
  const pathUrl = "/v3/payments/request";
  let body = {
    amount: req.body.amount,
    currency: "THB",
    orderId: nonce + "B",
    packages: [
      {
        id: nonce + "A",
        amount: req.body.amount,
        name: "Dreamcatcher Package",
        products: [
          {
            name: "ตาข่ายดักฝันรุ่น 1",
            quantity: 1,
            price: 100,
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/watercolor-dreamcatcher-with-flowers_45050-130.jpg?alt=media",
          },
          {
            name: "ตาข่ายดักฝันรุ่นที่ 2",
            quantity: 1,
            price: 150,
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/dowho-line-pay.appspot.com/o/b6b7c0478ba187e57082991f2ba3ca01.png?alt=media",
          },
        ],
      },
    ],
  };
  var header = genHeader(channelId, channelSecret, pathUrl, body, nonce);
  return request({
    method: `POST`,
    uri: `${baseUrl}${pathUrl}`,
    headers: header,
    body: JSON.stringify(body),
  })
    .then(async (data) => {
      await db
        .collection("orders")
        .doc(UUID)
        .set({
          amount: body.amount,
          currency: "THB",
          orderId: body.orderId,
          packages: body.packages,
          userid: req.body.userId,
          create_at: Date.now(),
        })
        .then(async function () {
          request({
            headers: LINE_HEADER,
            method: `POST`,
            uri: LINE_MESSAGING_API,
            body: JSON.stringify({
              to: req.userId,
              messages: [
                {
                  type: "flex",
                  altText: "รายการสั่งซื้อของคุณ",
                  contents: {
                    type: "bubble",
                    size: "giga",
                    body: {
                      type: "box",
                      layout: "vertical",
                      contents: content,
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
                },
              ],
            }),
          });
          await res.status(200).json({
            data: data,
            status: "success",
          });
        })
        .catch(function (error) {
          res.json({ "Error adding document: ": error });
        });
    })
    .then(() => {
      return res.send();
    })
    .catch((e) => {
      console.log(e);
      return res.send("Done");
    });
});

exports.app = functions.https.onRequest(app);
