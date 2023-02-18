const express = require("express");
const router = express.Router();
const path = require("path");

function getOnlineUsers(req) {
    const onlineUsers = req.app.usercache.getStats()["keys"];
    req.app.metrics.setOnlineCount(onlineUsers);
    return onlineUsers;
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
