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
    body = {
      amount: 250,
      currency: "THB",
      orderId: nonce + "B",
      packages: [
        {
          id: nonce + "A",
          amount: 250,
          name: "Dreamcatcher Package",
          products: [
            {
              name: "ตุ๊กตา Cony",
              quantity: 1,
              price: 100,
              imageUrl:
                "https://firebasestorage.googleapis.com/v0/b/linedeveloper-63341.appspot.com/o/512x512bb.jpg?alt=media&token=7cfd10b0-6d01-4612-b42e-b1b4d0105acd",
            },
            {
              name: "ตุ๊กตา Sally",
              quantity: 1,
              price: 150,
              imageUrl:
                "https://firebasestorage.googleapis.com/v0/b/linedeveloper-63341.appspot.com/o/8cd724371a6f169b977684fd69cc2339.jpg?alt=media&token=e2008ff7-1cad-4476-a2e4-cda5f8af6561",
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl:
          "https://0c1f44a56d0a.ngrok.io/dowho-line-pay/asia-east2/confirmOrder?userID=" +
          lah.userId(),
        cancelUrl:
          "https://0c1f44a56d0a.ngrok.io/dowho-line-pay/asia-east2/confirmOrder",
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
        currency: "THB"
      };
      var header = genHeader(channelId, channelSecret, pathUrl, body, nonce);
      return request({
        uri: `${baseUrl}${pathUrl}`,
        method: "POST",
        headers: header,
        body: JSON.stringify(body)
      })
        .then(data => {
          var jsondata = JSON.parse(data);
          if (jsondata.returnCode === "0000") {
            var payload = [
              {
                type: "text",
                text: "การชำระเงินเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ T Store"
              },
              payloadcreator.receipt()
            ];
            return lah.push(userId, payload);
          } else {
            var payload = [
              {
                type: "text",
                text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้"
              },
              {
                type: "text",
                text: jsondata.returnMessage
              }
            ];
            return lah.push(userId, payload);
          }
        })
        .then(data => {
          return res.send(
            "Successfully to get the data from LINE Pay,Please return to LINE App to see the payment result"
          );
        })
        .catch(e => {
          var payload = [
            {
              type: "text",
              text: "การชำระเงินไม่สมบูรณ์ ด้วยเหตุผลต่อไปนี้"
            },
            {
              type: "text",
              text: e
            }
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
                text: "การชำระเงินเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ Dreamcatcher Store",
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
            name: "ตุ๊กตา Cony",
            quantity: 1,
            price: 100,
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/linedeveloper-63341.appspot.com/o/512x512bb.jpg?alt=media&token=7cfd10b0-6d01-4612-b42e-b1b4d0105acd",
          },
          {
            name: "ตุ๊กตา Sally",
            quantity: 1,
            price: 150,
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/linedeveloper-63341.appspot.com/o/8cd724371a6f169b977684fd69cc2339.jpg?alt=media&token=e2008ff7-1cad-4476-a2e4-cda5f8af6561",
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl:
        "https://0c1f44a56d0a.ngrok.io/dowho-line-pay/asia-east2/confirmOrder?userID=" +
        req.body.userID,
      cancelUrl:
        "https://0c1f44a56d0a.ngrok.io/dowho-line-pay/asia-east2/confirmOrder",
    },
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
        .add({
          amount: body.amount,
          currency: "THB",
          orderId: body.orderId,
          packages: body.packages,
          status: "waiting",
          create_at: Date.now(),
        })
        .then(async function () {
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
