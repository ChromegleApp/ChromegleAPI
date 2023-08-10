const path = require("path");
const {getOnlineChromegleUsers} = require("../tools/chromegle.tools");

function getCount(request, response) {
    return response.json({count: getOnlineChromegleUsers(request)});
}

function getOwnerGif(request, response) {
    response.sendFile(path.join(__dirname, "../../", "/resources/owner.gif"));
}


module.exports = {
    getCount,
    getOwnerGif
}