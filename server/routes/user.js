const express = require("express");
const router = express.Router();

const {
  addUser,
  getUser,
  updateLastPaid,
  hasValidSubscription,
} = require("../controllers/user");

// create user
router.post("/", addUser);
// get user
router.get("/details", getUser);
// update last paid
router.post("/last_paid", updateLastPaid);
// check if user has valid subscription
router.get("/has_subscription", hasValidSubscription);

module.exports = router;
