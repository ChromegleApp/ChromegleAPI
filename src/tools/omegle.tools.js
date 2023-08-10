const axios = require("axios");

function generateRequestURL() {
    return `https://front38.omegle.com/status?nocache=${Math.random()}&randid=${(Math.random() + 1).toString(36).substring(7)}`
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
    getOmegleStats,
}