const {
    cleanIpAddress,
    cleanResponse,
    logGeolocationMetric,
    lookupAddress
} = require("../tools/geolocate.tools");

const config = require("../../resources/config.json");
const {checkIfChromegleUser} = require("../tools/chromegle.tools");

async function geolocate(request, response) {

    let requestAddress = request?.query?.address;
    let cleanedAddress = cleanIpAddress(requestAddress);

    // Clean address
    if (cleanedAddress == null) {
        response.status(400).send({error: "Invalid or missing IP Address."});
        return;
    }

    let addressInfo = await lookupAddress(cleanedAddress);

    // Response validation
    if (addressInfo == null) {
        response.status(500).send({error: "Failed to retrieve from the geo-location agent due to an error."});
        return;
    }

    let cleanedResult = cleanResponse(addressInfo);

    // Confirm it's valid
    if (cleanedResult == null) {
        response.status(500).send({ error: "Failed to geo-locate due to an invalid response payload."});
        return;
    }

    // Check if user is a Chromegler
    cleanedResult.chromegler = true // checkIfChromegleUser(cleanedResult.ip, request.app.usercache);
    cleanedResult = (cleanedResult.ip === process.env.OWNER_IP) ? config.owner_fake : cleanedResult;

    // Log the metrics
    logGeolocationMetric(cleanedResult, request.app.metrics);
    return response.json(cleanedResult);

}

function tips(_, response) {
    return response.json(config.tips);
}

async function metrics(request, response) {
    response.set("Content-Type", request.app['metrics'].prom.contentType);
    return response.send(await response.app['metrics'].prom.metrics());
}

module.exports = {
    geolocate,
    tips,
    metrics
}
