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
                    labelNames: ['ip', 'country_code', 'city', 'asn', 'chromegler', 'region']
                }
            )
        }

    }

    constructor() {
        this.prom = new Registry();
        this.registerMetrics();
    }

    registerMetrics() {
        for (const metric of this.metrics) {
            this.prom.registerMetric(metric);
        }
    }

    setOnlineCount(count) {
        this.metrics?.online_count?.object.set(count);
    }

    insertGeolocationRequest(labelData) {
        this.metrics?.geolocation_request_count?.object.labels(labelData).inc(1);
    }

}


module.exports = ChromegleStatistics;
