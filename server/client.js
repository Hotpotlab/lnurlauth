const fs = require("fs");
const request = require("request");

const REST_HOST = "attack-titan.t.voltageapp.io:8080";
const MACAROON_PATH =
  "/Users/eswar/Desktop/hotpot/lnurlauth/server/config/adminbase.macaroon";

async function createLnInvoice() {
  const req = {
    value: parseInt(1000),
    private: false,
  };

  let options = {
    url: `https://${REST_HOST}/v1/invoices`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": fs.readFileSync(MACAROON_PATH).toString("hex"),
    },
    form: JSON.stringify(req),
  };

  return await postRequest(options);
}

async function verifyInvoice(invoice) {
  let options = {
    url: `https://${REST_HOST}/v1/invoice/${invoice}`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": fs.readFileSync(MACAROON_PATH).toString("hex"),
    },
  };

  return await getRequest(options);
}

async function postRequest(options) {
  return new Promise((resolve, reject) => {
    request.post(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        console.log(body);
        resolve(body);
      }
    });
  });
}

async function getRequest(options) {
  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body.settled);
      }
    });
  });
}

module.exports = { createLnInvoice, verifyInvoice };
// module.exports = client;
