const {getOmegleStats} = require("../tools/omegle.tools");

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

async function registerPrometheusOmegleMetrics(app) {
    let users = ((await getOmegleStats(app?.usercache))?.count) || 0;
    app.metrics.setOmegleCount(users);
}


const isNumeric = (str) => {
    if (typeof str === "number") return true
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

module.exports = {
    registerPrometheusOmegleMetrics,
    isNumeric,
    getTimestamp
}
