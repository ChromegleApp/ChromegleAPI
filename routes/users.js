const express = require("express");
const router = express.Router();

function getOnlineUsers(req) {
    return req.app.usercache.getStats()["keys"];
}


router.get("/", async (req, res) => {

    return res.json({
        count: getOnlineUsers(req)
    });

});


module.exports = router;
