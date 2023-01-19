const express = require("express");
const router = express.Router();
const config = require("../resources/config.json");
const axios = require("axios");
const path = require("path");

function getOnlineUsers(req) {
    return req.app.usercache.getStats()["keys"];
}


router.get("/", async (req, res) => {

    return res.json({
        count: getOnlineUsers(req)
    });

});


router.get("/owner/gif", async (req, res) => {
    return res.sendFile(path.join(__dirname, "../", "/resources/owner.gif"));
});

module.exports = router;
