const net = require("net");
const axios = require("axios");

const ADDRESS_REGEX = /^([0-9A-Z:.])+$/i;
const VALID_CODES = [
    "region",
    "latitude",
    "longitude",
    "accuracy",
    "country_code",
    "country_code3",
    "timezone",
    "asn",
    "organization",
    "ip",
    "city",
    "country",
    "continent_code"
]

function cleanIpAddress(address) {

    // Test address is not being injected
    if (!ADDRESS_REGEX.test(address)) {
        return null;
    }

    // Confirm is address
    if (!net.isIP(address)) {
        return null;
    }

    // Just in case bro...
    return address.replaceAll("&", "");

}

async function lookupAddress(address) {

    if (address == null) {
        return null;
    }

    try {
        return (await axios.get(`https://get.geojs.io/v1/ip/geo/${address}.json`))?.data;
    } catch (ex) {
        return null;
    }

}


function cleanResponse(data) {

    if (data == null) {
        return null;
    }

    // Must have these keys
    let keys = Object.keys(data);
    if (!(keys.includes("ip") && keys.includes("asn"))) {
        return null;
    }

    // Clean codes
    Object.keys(data).forEach((key) => VALID_CODES.includes(key) || delete data[key]);

    // Return values
    return data;

}


/**
 * Log the country of each geolocation IP requested. For specific countries,
 * log the *region* in the country the request originates from.
 *
 * It's important to not log the region for every country due to high cardinality.
 * Explanation: https://www.robustperception.io/cardinality-is-key/
 */
function logGeolocationMetric(data, metrics) {

    // Get country & region
    let country = data?.["country_code"] || null;
    let region = data?.["region"] || null;

    let labelConfig = {"country": country, "region": "N/A"}

    // Only care about regions within these countries
    if (["US", "GB", "CA"].includes(country) && region != null) {
        labelConfig["region"] = region;
    }

    // Register metrics
    metrics.insertGeolocationRequest(labelConfig);

}

module.exports = {
    cleanIpAddress,
    lookupAddress,
    cleanResponse,
    logGeolocationMetric
}