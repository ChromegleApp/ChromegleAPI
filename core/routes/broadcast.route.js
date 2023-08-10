const express = require("express");
const {expireBroadcasts} = require("../tools/broadcast.tools");
const {sendBroadcast, getBroadcast} = require("../controllers/broadcast.controller");
const router = express.Router();

router.broadcasts = [];
router.defaultExpireAfter = 15 * 60;
router.maxExpiresAfter = 60 * 60 * 12;
router.expireTask = setInterval(() => expireBroadcasts(router), 10 * 1000);

router.post("/", async function(request, response) {
    return await sendBroadcast(request, response, router);
});

router.get("/", async function (request, response) {
   return await getBroadcast(request, response, router);
});

module.exports = router;