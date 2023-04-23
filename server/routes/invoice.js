const express = require("express");
const router = express.Router();

const { getInvoice } = require("../controllers/invoice");

// get invoice
router.get("/", getInvoice);

module.exports = router;
