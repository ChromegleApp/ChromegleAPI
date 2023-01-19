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
    if (!req?.query?.["chromegler"]) {
        console.log('not a chromegler');
        return;
    }

    // Set chromegle status
    try {
        await req.app.redis.set(`chromegle:users:${req.ip}`, "", {'EX': config.expire_chromegler});
    } catch (ex) {
    }

}

async function checkIfChromegler(req, data) {
    try {
        return (await req.app.redis.get(`chromegle:users:${data.ip}`)) !== null;
    } catch (ex) {

    }
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
            response.data["chromegler"] = await checkIfChromegler(req, response.data);
            response.data["owner"] = response.data?.ip === config.owner_ip;
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
