const express = require("express");
const router = express.Router();
const crypto = require('crypto');

router.broadcasts = [];
router.expireAfter = 15 * 60 * 1000;

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

router.post("/", (req, res) => {

    // Token must be set, token must match
    if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN !== req.headers['authorization']) {
        console.log(process.env.ADMIN_TOKEN, req.headers['authorization'])
        return res.status(403).json({status: 403, message: 'No Permission'});
    }

    // Needs to be valid message
    if (!req.body.message || req.body.message.length > 100) {
        return res.status(400).json({status: 400, message: 'Invalid message or too long'})
    }

    // Needs to have valid target
    if (!req.body.target) {
        return res.status(400).json({status: 400, message: 'Must include a target'});
    }

    let uuid = crypto.randomUUID();

    // Add broadcast
    router.broadcasts.push({
        id: uuid,
        message: req.body.message,
        expires: getTimestamp() + router.expireAfter,
        target: req.body.target
    });

    return res.status(200).json({status: 200, id: uuid});

});

function expireBroadcasts() {
    let broadcasts = [...router.broadcasts];
    let goodBroadcasts = [];

    for (let i=0; i < broadcasts.length; i++) {
        let instance = broadcasts[i];

        if (getTimestamp() > instance.expires) {
            continue;
        }

        goodBroadcasts.push(instance);
    }

    router.broadcasts = goodBroadcasts;

}

router.get("/", (req, res) => {

    // Update broadcasts
    expireBroadcasts();

    return res.status(200).json({
        broadcasts: router.broadcasts,
        timestamp: getTimestamp(),
        status: 200
    });

});


module.exports = router;