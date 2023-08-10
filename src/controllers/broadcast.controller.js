const {getExpireTime} = require("../tools/broadcast.tools");
const {getTimestamp} = require("../modules/general.module");
const crypto = require('crypto');
async function sendBroadcast(request, response, router) {
    // Token must be set, token must match
    if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN !== request.headers['authorization']) {
        console.log(process.env.ADMIN_TOKEN, request.headers['authorization'])
        return response.status(403).json({status: 403, message: 'No Permission'});
    }

    // Needs to be valid message
    if (!request.body.message || request.body.message.length > 100) {
        return response.status(400).json({status: 400, message: 'Invalid message or too long'})
    }

    // Needs to have valid target
    if (!request.body.target) {
        return response.status(400).json({status: 400, message: 'Must include a target'});
    }

    let uuid = crypto.randomUUID();
    let expires = getTimestamp() + getExpireTime(request, router);

    // Add sendBroadcast
    router.broadcasts.push({
        id: uuid,
        message: request.body.message,
        expires: expires,
        target: request.body.target
    });

    return response.status(200).json({status: 200, id: uuid, expires: expires});
}

async function getBroadcast(request, response, router) {
    let responseData = {
        broadcasts: router.broadcasts,
        timestamp: getTimestamp(),
        status: 200
    };

    return response.status(200).json(responseData);
}

module.exports = {
    sendBroadcast,
    getBroadcast
}