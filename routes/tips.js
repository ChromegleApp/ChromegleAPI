let tips = require("../resources/tips.json");
const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {
   return res.json(tips);
});


module.exports = router;
