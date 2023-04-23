const db = require("../db");
const { uuid } = require("uuidv4");
/*
 user table schema:
 id (uuid, primary key)
 pubkey (string)
 last_paid (date)
 frequency (int, set default 30)
*/

async function getUser(req, res) {
  try {
    const { pubkey } = req.body;
    if (!pubkey) {
      return res.status(400).json({ error: "Missing id" });
    }
    const user = (await db.select("*").from("users").where({ pubkey }))[0];
    console.log(user);
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function addUser(req, res) {
  const { pubkey } = req.body;
  if (!pubkey) {
    return res.status(400).json({ error: "Missing pubkey" });
  }
  const frequency = 30;
  const last_paid = new Date();
  last_paid.setDate(last_paid.getDate() - 30);
  const id = uuid();
  const user = await db("users")
    .insert({ id, pubkey, frequency, last_paid })
    .returning("*");
  res.json({ user });
}

async function updateLastPaid(req, res) {
  const { pubkey } = req.body;
  if (!pubkey) {
    return res.status(400).json({ error: "Missing id" });
  }
  const last_paid = new Date();
  const user = await db("users")
    .where({ pubkey })
    .update({ last_paid })
    .returning("*");
  res.json({ user });
}

async function hasValidSubscription(req, res) {
  const { pubkey } = req.body;
  if (!pubkey) {
    return res.status(400).json({ error: "Missing id" });
  }
  const user = await db("users").where({ pubkey });
  const last_paid = user.last_paid;
  const frequency = user.frequency;
  const now = new Date();
  const diff = now - last_paid;
  const days = diff / (1000 * 60 * 60 * 24);
  if (days > frequency) {
    return res.status(400).json({ error: "Subscription expired" });
  }
  res.status(200).json({ msg: "OK" });
}

async function getByPubkey(pubkey) {
  try {
    const users = await db("users").where({ pubkey });
    if (users.length > 0) {
      return users[0];
    }
    return null;
  } catch (error) {
    console.error("Error in getByPubkey:", error);
    return null;
  }
}

module.exports = {
  getUser,
  addUser,
  updateLastPaid,
  hasValidSubscription,
  getByPubkey,
};
