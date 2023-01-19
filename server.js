const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || "3000";
const tipRoute = require("./routes/tips");
const geoRoute = require("./routes/geolocate");
const Logger = require("./modules/logger");
const config = require("./resources/config.json");
const redis = require("redis");

// Use X-Forwarded-For IP for rate limiting
app.enable("trust proxy");
app.use(require("cors")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.redis = redis.createClient({"url": `redis://default:${config.redis.password}@${config.redis.host}:${config.redis.port}`});

/**
 * Connect to Redis
 */
app.redis.connect().then(() => {
    Logger.INFO("Redis successfully connected");
})

/**
 * CORS Settings
 */
app.options("*", (req, res) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

/**
 * Logger Requests
 */
app.use((req, res, next) => {

    res.on(
        "finish",
        () => Logger.INFO("%s - \"REQUEST %s\"", res.statusCode, req.ip, req.originalUrl)
    );

    next();

});


app.use("/geolocate", geoRoute);
app.use("/tips", tipRoute);
app.all('*', (_, res) => res.redirect("https://chromegle.net/"));
server.listen(PORT, () => Logger.INFO(`Listening on port ${PORT} for connections!`));
