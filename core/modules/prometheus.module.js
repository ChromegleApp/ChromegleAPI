const {collectDefaultMetrics} = require("prom-client");
const {Registry, Counter, Gauge} = require('prom-client');

class ChromegleStatistics {

    prefix = "chromegle_api";
    metrics = {
        "online_count": {
            "object":  new Gauge(
                {
                    name: `${this.prefix}_online_count`,
                    help: "Currently online count of Chromegle users"
                }
            )
        },
        "geolocation_request_count": {
            "object": new Counter(
                {
                    name: `${this.prefix}_geolocation_request_count`,
                    help: "Number of requests made to the geolocation endpoint",
                    labelNames: ['country', 'region']
                }
            )
        },
        "api_request_count": {
            "object": new Counter(
                {
                    name: `${this.prefix}_api_request_count`,
                    help: "Number of requests made to the API as a whole",
                }
            )
        },
        "omegle_count": {
            "object": new Gauge(
                {
                    name: `${this.prefix}_omegle_count`,
                    help: "Currently online count of Omegle users"
                }
            )
        }
    }

    constructor() {
        this.prom = new Registry();
        collectDefaultMetrics({register: this.prom});
        this.registerMetrics();
    }

    registerMetrics() {

        for (const metric of Object.values(this.metrics)) {
            this.prom.registerMetric(metric.object);
        }
    }

    setOnlineCount(count) {
        this.metrics?.online_count?.object.set(count);
    }

    setOmegleCount(count) {
        this.metrics?.omegle_count?.object.set(count);
    }

    insertGeolocationRequest(labelData) {
        this.metrics?.geolocation_request_count?.object.labels(labelData).inc(1);
    }

    insertApiRequest() {
        this.metrics?.api_request_count?.object?.inc(1);
    }

}


module.exports = ChromegleStatistics;
