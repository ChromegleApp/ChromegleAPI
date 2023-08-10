const express = require("express");
const {status, count} = require("../controllers/omegle.controller");
const router = express.Router();

router.get("/status", async function (request, response){
    await status(request, response, request.app['gencache']);
});

router.get("/count", async function (request, response) {
   await count(request, response, request.app['gencache']);
});

module.exports = router;