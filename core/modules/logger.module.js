const Logger = {

    ERROR: (message, status, ...formatting) => {
        Logging.LOG(Logging.LogLevel.ERROR, message, status, ...formatting)
    },

    INFO: (message, status, ...formatting) => {
        Logging.LOG(Logging.LogLevel.INFO, message, status, ...formatting)
    },

    DEBUG: (message, status, ...formatting) => {
        Logging.LOG(Logging.LogLevel.DEBUG, message, status, ...formatting)
    },

    WARNING: (message, status, ...formatting) => {
        Logging.LOG(Logging.LogLevel.WARNING, message, status, ...formatting)
    },

}


class Logging {

    static #stringInterpolation(input, formatting) {
        const _r=function(p,c){return p.replace(/%s/,c);}
        return formatting.reduce(_r, input);
    }

    static #parseCode(code) {
        if (!code) return "";
        let good = code === 200 || code === 304
        let message;

        if (code <= 399) message = "OK";
        else if (code <= 499) {
            if (code === 429) {
                message = "Too Many Requests";
            } else {
                message = "Client Error";
            }
        } else message = "Server Error";

        return `${good ? this.LogLevel.INFO["color"] : this.LogLevel.ERROR["color"]} ${code} ${message}`
    }

    static LOG(logLevel, message, code, ...formatting) {
        console.log(
            `[${new Date().toISOString()}] ${logLevel["color"]}${logLevel["label"]}${this.#stringInterpolation(message, formatting)}${this.#parseCode(code)}\x1b[0m`,
        )
    }

    static LogLevel = {
        INFO: {
            "label": "INFO\x1b[37m:    ",
            "color": "\x1b[32m"
        },
        ERROR: {
            "label": "ERROR\x1b[37m:     ",
            "color": "\x1b[31m"
        },
        DEBUG: {
            "label": "DEBUG\x1b[37m:     ",
            "color": "\x1b[32m"
        },
        WARNING: {
            "label": "WARN\x1b[37m:    ",
            "color": "\x1b[33m"
        }
    }

}

module.exports = Logger;
