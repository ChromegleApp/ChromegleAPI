const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const PORT = process.env.PORT || "3000";
const usersRoute = require("./routes/users");
const baseRoute = require("./routes/base");
const omegleRoute = require("./routes/omegle");
const Logger = require("./modules/logger");
const tools = require("./modules/tools");
const NodeCache = require("node-cache");
const ChromegleStatistics = require("./modules/stats");

// Use x-forwarded-for IP for rate limiting
app.enable("trust proxy");
app.use(require("cors")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.usercache = new NodeCache({stdTTL: 300, checkperiod: 30});
app.gencache = new NodeCache({stdTTL: 300, checkperiod: 30});
app.metrics = new ChromegleStatistics();

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
        () => Logger.INFO("%s - \"REQUEST %s\"", res.statusCode, req.headers['x-forwarded-for'], req.originalUrl)
    );

    next();

});


app.use("/", baseRoute);
app.use("/users", usersRoute);
app.use("/omegle", omegleRoute);
app.all('*', (_, res) => res.redirect("https://chromegle.net/"));

server.listen(PORT, async () => {
    Logger.INFO(`Listening on port ${PORT} for connections!`);

    // Register Prometheus Omegle Metrics
    setInterval(async () => await tools.registerPrometheusOmegleMetrics(app), 60 * 1000);
    await tools.registerPrometheusOmegleMetrics(app);

});
