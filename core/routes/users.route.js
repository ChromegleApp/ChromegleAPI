const express = require("express");
const {getCount, getOwnerGif} = require("../controllers/users.controller");
const router = express.Router();

router.get("/", getCount);  // Deprecated
router.get("/count", getCount);
router.get("/owner/gif", getOwnerGif);

module.exports = router;