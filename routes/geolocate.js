const { rateLimit } = require('express-rate-limit');
const express = require("express");
const router = express.Router();
const EventEmitter = require("events");
var request = require('request');
let net = require('net');

router.ioCallbacks = new EventEmitter();

const rateLimitMinute = rateLimit({
    windowMs: 60 * 1000,
    max: 60
});


/**
 * Sign URL endpoint
 */
router.get("/", rateLimitMinute, async (req, res) => {

    if (!net.isIP(req.query.address)) {
        res.status(400).send({ error: "Invalid or missing IP Address" });
        return;
    }

    try {
        request(`https://get.geojs.io/v1/ip/geo/${req.query.address}.json`).pipe(res);
    } catch (err) {
        res.status(500).send({ error: "Timeout" });
    }
});


module.exports = router;
