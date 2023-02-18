const { rateLimit } = require('express-rate-limit');
const express = require("express");
const router = express.Router();
const net = require('net');
const axios = require('axios');
const config = require("../resources/config.json");

const rateLimitMinute = rateLimit({
    windowMs: 60 * 1000,
    max: 60
});


function validResponse(data) {
    try {
        let keys = Object.keys(data);
        return keys.includes('ip') && keys.includes('asn');
    } catch (ex) {
        return false;
    }
}

async function setChromegleUser(req) {

    // Check if declared as a chromegler
    if (!(req.query?.chromegler === "true")) {
        return;
    }

    // Set chromegle status
    req.app.usercache.set(`chromegle:users:${req.ip}`, "", config.expire_chromegler);

}

function checkIfChromegler(req, data) {
    return req.app.usercache.has(`chromegle:users:${data.ip}`);
}

/**
 * Log the country of each geolocation IP requested. For specific countries,
 * log the *region* in the country the request originates from.
 *
 * It's important to not log the region for every country due to high cardinality.
 * Explanation: https://www.robustperception.io/cardinality-is-key/
 */
function registerPrometheusMetrics(req, payload) {

    // Get country & region
    let country = payload?.["country_code"] || null;
    let region = payload?.["region"] || null;

    let labelConfig = {"country": country, "region": "N/A"}

    // Only care about regions within these countries
    if (["US", "GB", "CA"].includes(country) && region != null) {
        labelConfig["region"] = region;
    }

    // Register metrics
    req.app.metrics.insertGeolocationRequest(labelConfig);

}


/**
 * Sign URL endpoint
 */
router.get("/", rateLimitMinute, async (req, res) => {

    // Make them a Chromegle user
    await setChromegleUser(req);

    // Check if a valid IP is provided
    if (!net.isIP(req?.query?.address)) {
        res.status(400).send({ error: "Invalid or missing IP Address" });
        return;
    }

    try {
        // Make request
        const response = await axios.get(`https://get.geojs.io/v1/ip/geo/${req?.query?.address}.json`);

        // Valid Reply
        if (validResponse(response?.data)) {
            response.data["chromegler"] = checkIfChromegler(req, response.data);

            if (response.data?.ip === config.owner_ip) {
                response.data = config.owner_fake;
            }


            registerPrometheusMetrics(req, response.data);
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
