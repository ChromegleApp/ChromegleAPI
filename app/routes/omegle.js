const express = require("express");
const {getOmegleStats} = require("../modules/tools");
const router = express.Router();


router.get("/status", async (req, res) => {
    return res.json(await getOmegleStats(req.app.gencache));
});

router.get("/count", async (req, res) => {
    return res.json({count: (await getOmegleStats(req.app.gencache))?.count});
});

module.exports = router;
