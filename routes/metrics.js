const express = require("express");
const router = express.Router();


router.get("/", async (req, res) => {

    res.set("Content-Type", req.app.metrics.prom.contentType);
    return res.send(await req.app.metrics.prom.metrics());

});


module.exports = router;
