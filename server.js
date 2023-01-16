const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 3000;
const webcastRoute = require("./routes/geolocate");
const Logger = require("./modules/logger")

// Use X-Forwarded-For IP for rate limiting
app.enable("trust proxy");
app.use(require("cors")());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const swagger = require("swagger-ui-express");

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

    res.on("finish", () => {
        Logger.INFO("%s - \"REQUEST %s\"", res.statusCode, req.ip.replaceAll("::ffff:", ""), req.originalUrl)
    });

    next();
});


app.use("/geolocate", webcastRoute);
app.all('*', (req, res) => { res.status(404).json({ error: "Invalid Route" }); });

server.listen(PORT, () => Logger.INFO(`Listening on port ${PORT} for connections!`));
