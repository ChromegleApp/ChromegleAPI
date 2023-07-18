const axios = require("axios");
const config = require("../resources/config.json");

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

async function setChromegleUser(req) {

    // Check if declared as a chromegler
    if (!(req.query?.chromegler === "true")) {
        return;
    }

    let ip = req.headers["x-forwarded-for"]

    // Set chromegle status
    req.app.usercache.set(`chromegle:users:${ip}`, "", config.expire_chromegler);

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

module.exports = {
    registerPrometheusOmegleMetrics,
    getOmegleStats,
    validGeoResponse,
    setChromegleUser,
    checkIfChromegler,
    registerPrometheusGeoMetrics
}
