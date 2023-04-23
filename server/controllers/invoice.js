const fs = require("fs");
const request = require("request");
const { uuid } = require("uuidv4");

const db = require("../db");

/*
    invoice schema
    id (uuid, primary key)
    user_id (uuid, foreign key)
    created_at (date)
 */

// get the latest invoice for a user id
async function getInvoice(req, res) {
  const { pubkey } = req.body;
  if (!pubkey) {
    return res.status(400).json({ error: "Missing id" });
  }
  const user = (await db.select("*").from("user").where({ pubkey }))[0];

  const invoice = await db("invoice")
    .where({ user_id: user.id })
    .orderBy("created_at", "desc")
    .first();
  res.json({ invoice });
}

// This would not be called directly by the user, but by the server using a cron job
// create an invoice for a user id
async function createInvoice(id) {
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  //   check if the user still has time left on their subscription
  const user = await db("user").where({ id });
  const last_paid = user.last_paid;
  const frequency = user.frequency;
  const now = new Date();
  const diff = now - last_paid;
  const days = diff / (1000 * 60 * 60 * 24);
  if (days <= frequency) {
    return res.status(400).json({
      error:
        "Subscription not expired, please wait untill new invoice is generated",
    });
  }

  const created_at = new Date();
  const invoice = createLnInvoice();
  const user_id = id;
  const invoice_id = uuid();

  //   store invoice in db
  await db("invoice").insert({ id: invoice_id, user_id, created_at, invoice });

  // TODO: Send invoice to user using email or LN
  // await sendInvoice(invoice);

  res.json({ invoice });
}

async function createLnInvoice(userId) {
  const subscription_sats = 1000;
  const macaroon =
    "AgEDbG5kAvgBAwoQ+8oA+/hZkT4xN8DgWbvhRRIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgeYGuKakOoUBG+k3cm6ou/n71xQtUmlJ32vUzOgvgWPU=";
  const host = "attack-titan.t.voltageapp.io:8080";

  let requestBody = {
    memo: "Subscription " + userId + " " + new Date(),
    value: subscription_sats,
  };

  let options = {
    url: `https://${host}/v1/invoices`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
      "Grpc-Metadata-macaroon": macaroon,
    },
    form: JSON.stringify(requestBody),
  };
  let invoice;
  request.post(options, function (error, response, body) {
    invoice = body.payment_request;
  });
  return invoice;
}

module.exports = {
  getInvoice,
  createInvoice,
  createLnInvoice,
};
