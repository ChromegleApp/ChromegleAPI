const axios = require("axios");
const config = require("../resources/config.json");
const {add} = require("nodemon/lib/rules");

function generateRequestURL() {
    return `https://front38.omegle.com/status?nocache=${Math.random()}&randid=${(Math.random() + 1).toString(36).substring(7)}`
}


function validGeoResponse(data) {
    try {
        let keys = Object.keys(data);
        return keys.includes('ip') && keys.includes('asn');
    } catch (ex) {
        return false;
    }
}

/**
 * Used to clean Ipv6 addresses before storing them, since : is our delimiter
 */
function getCacheString(address) {
    let cleanedAddress = address.replaceAll(":", "."); // Remove ":", it is our delimiter
    return "chromegle:users:" + cleanedAddress;
}

async function setChromegleUser(req) {

    // Check where the request comes from (Omegle = Chromegle)
    if (!req?.headers?.origin?.includes("omegle.com")) {
        return;
    }

    let ip = req.headers["x-forwarded-for"] || req.ip;

    // Validate IP exists
    if (ip == null) {
        return;
    }

    // Set chromegle status
    req.app.usercache.set(`chromegle:users:${getCacheString(ip)}`, "", config.expire_chromegler || 300);

}

function checkIfChromegler(req, data) {

    // Validate IP exists
    if (data?.ip == null) {
        return false;
    }

    return req.app.usercache.has(`chromegle:users:${getCacheString(data.ip)}`);
}

/**
 * Log the country of each geolocation IP requested. For specific countries,
 * log the *region* in the country the request originates from.
 *
 * It's important to not log the region for every country due to high cardinality.
 * Explanation: https://www.robustperception.io/cardinality-is-key/
 */
function registerPrometheusGeoMetrics(req, payload) {

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

async function registerPrometheusOmegleMetrics(app) {
    let users = ((await getOmegleStats(app?.usercache))?.count) || 0;
    app.metrics.setOmegleCount(users);
}

async function getOmegleStats(cache = null) {
    let res = cache?.get("omegle:stats");
    if (res) return res;

    try {
        let response = await axios.get(generateRequestURL());
        if (response.data != null) {
            cache?.set("omegle:stats", response.data, 60);
            return response.data;
        }

    } catch (ex) {

    }

    return null;

}

const isNumeric = (str) => {
    if (typeof str === "number") return true
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

module.exports = {
    registerPrometheusOmegleMetrics,
    getOmegleStats,
    validGeoResponse,
    setChromegleUser,
    isNumeric,
    checkIfChromegler,
    registerPrometheusGeoMetrics
}
