const express = require("express");
const router = express.Router();
const tools = require("../modules/tools.js");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const net = require("net");
const config = require('../resources/config.json');

router.get("/metrics", async (req, res) => {

    res.set("Content-Type", req.app.metrics.prom.contentType);
    return res.send(await req.app.metrics.prom.metrics());

});

router.get("/tips", async (req, res) => {
    return res.json(config.tips);
});


const geoRateLimitMinute = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: (request, _) => request.headers["x-forwarded-for"]
});


router.get("/geolocate", geoRateLimitMinute, async (req, res) => {

    // Check if a valid IP is provided
    if (!net.isIP(req?.query?.address)) {
        res.status(400).send({ error: "Invalid or missing IP Address" });
        return;
    }

    try {
        // Make request
        const response = await axios.get(`https://get.geojs.io/v1/ip/geo/${req?.query?.address}.json`);

        // Valid Reply
        if (tools.validGeoResponse(response?.data)) {
            response.data["chromegler"] = tools.checkIfChromegler(req, response.data);

            if (response.data?.ip === process.env.OWNER_IP || "") {
                response.data = config.owner_fake;
            }

            tools.registerPrometheusGeoMetrics(req, response.data);
            return res.json(response.data);
        }

        // Invalid response
        res.status(500).send({ error: "Failed to geo-locate due to an invalid response payload" });
    } catch (error) {
        // Request error
        res.status(500).send({ error: "Failed to geo-locate due to a caught exception" });
    }

});

module.exports = router;
