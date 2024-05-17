const express = require('express');
const axios = require('axios');
const uniqid = require('uniqid');
const sha256 = require('sha256');
const app = express();
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
const PORT = 3001;
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const MERCHANT_ID = "HALEKARDUAT";
const SALT_INDEX = 1;
const SALT_KEY = "63eb34bd-db8f-40a5-adcf-7ce28f80e112";
let HEALTHKARD_ID = "";

app.get('/', (req, res) => {
  res.send("Phone pay server is running");
});

app.get('/pay', (req, res) => {
  const { name, mobileNumber, healthID, amount } = req.query;
  HEALTHKARD_ID = healthID;
  const payEndPoint = "/pg/v1/pay";
  let merchantTransactionId = uniqid();
  let merchantUserId = "MUID123";
  const payload = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": merchantTransactionId,
    "merchantUserId": merchantUserId,
    "amount": amount * 100, // use the provided amount
    "redirectUrl": `http://localhost:3001/redirect-url/${merchantTransactionId}`,
    "redirectMode": "REDIRECT",
    "name": name,
    "mobileNumber": mobileNumber,
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  };

  let bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
  let base64EncodedPayload = bufferObj.toString("base64");
  const xVerify = sha256(base64EncodedPayload + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;
  const options = {
    method: 'post',
    url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': xVerify,
    },
    data: {
      request: base64EncodedPayload
    }
  };

  axios
    .request(options)
    .then(function (response) {
      const url = response.data.data.instrumentResponse.redirectInfo.url;
      res.redirect(url);
    })
    .catch(function (error) {
      res.send({ message: "Error", error });
    });
});

app.get("/redirect-url/:merchantTransactionId", (req, res) => {
  const { merchantTransactionId } = req.params;
  if (merchantTransactionId) {
    const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_INDEX;
    const options = {
      method: 'get',
      url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': merchantTransactionId,
        'X-VERIFY': xVerify
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data.code);
        if (response.data.code === "PAYMENT_SUCCESS") {
          res.redirect(`http://localhost:3000/userCard/${HEALTHKARD_ID}`);
        } else {
          // Handle other statuses if needed
          res.send("Payment not successful");
        }
      })
      .catch(function (error) {
        res.send(error);
      });
  } else {
    res.send({ error: "Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Phone pay server is running on port: ${PORT}`);
});
