const express = require("express");
const router = express.Router();

// user routes
router.use("/user", require("./user"));
// invoice routes
router.use("/invoice", require("./invoice"));

module.exports = router;
