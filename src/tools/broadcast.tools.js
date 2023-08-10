const {isNumeric, getTimestamp} = require("../modules/general.module");


function expireBroadcasts(router) {
    let broadcasts = [...router.broadcasts];
    let goodBroadcasts = [];

    for (let i = 0; i < broadcasts.length; i++) {
        let instance = broadcasts[i];

        if (getTimestamp() > instance.expires) {
            continue;
        }

        goodBroadcasts.push(instance);
    }

    router.broadcasts = goodBroadcasts;

}

function getExpireTime(request, router) {

    if (isNumeric(request?.body?.duration)) {
        return Math.max(0, Math.min(parseInt(request.body.duration), router.maxExpiresAfter));
    }

    return router.defaultExpireAfter;

}

module.exports = {
    expireBroadcasts,
    getExpireTime
}