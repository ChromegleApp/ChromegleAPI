const config = require("../../resources/config.json");

function getOnlineChromegleUsers(request) {
    const onlineUsers = request.app.usercache.getStats()["keys"];
    request.app.metrics.setOnlineCount(onlineUsers);
    return onlineUsers;
}


function getCacheString(address) {
    let cleanedAddress = address.replaceAll(":", "."); // Remove ":", it is our delimiter
    return "chromegle:users:" + cleanedAddress;
}

function setChromegleUser(request) {

    // Check where the request comes from (Omegle = Chromegle)
    if (!request?.headers?.origin?.includes("omegle.com")) {
        return;
    }

    let ip = request.headers["x-forwarded-for"] || request.ip;

    // Validate IP exists
    if (ip == null) {
        return;
    }

    // Set chromegle status
    request.app.usercache.set(getCacheString(ip), "", config.expire_chromegler || 300);

}

function checkIfChromegleUser(address, cache) {

    // Validate IP exists
    if (address == null) {
        return false;
    }

    return cache.has(getCacheString(address));
}


module.exports = {
    getOnlineChromegleUsers,
    setChromegleUser,
    checkIfChromegleUser
}
