const express = require("express");
const {rateLimit} = require("express-rate-limit");
const {geolocate, metrics, tips} = require("../controllers/home.controller");
const router = express.Router();

const geoLimitMinute = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    keyGenerator: (request, _) => request.headers["x-forwarded-for"] || request.ip
});

router.get("/geolocate", geoLimitMinute, geolocate);
router.get("/tips", tips);
router.get("/metrics", metrics);

module.exports = router;