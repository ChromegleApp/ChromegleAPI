const {getOmegleStats} = require("../tools/omegle.tools");

async function status(_, response, cache) {
    return response.json(await getOmegleStats(cache));
}

async function count(_, response, cache) {
    return response.json({count: (await getOmegleStats(cache))?.count});
}

module.exports = {
    status,
    count
}