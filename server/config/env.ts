import { logger, LOG_TYPE } from "../tools/common";
import * as dotenv from 'dotenv';
import { ENV_LIST } from "../tools/constants";

interface IConfig {
    SERVER_URL: string,
    APP_PORT: string | number,
    MONGO_URI: string,
    getAppBaseURL: () => string,
    getParsedURL: () => string
}

const conf: { [type: string]: IConfig } = {
    production: {
        SERVER_URL: "rifugi.cai.it",
        APP_PORT: process.env.PORT || 8000,
        MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB',
        getAppBaseURL: function () {
            return 'http://' + this.SERVER_URL
        },
        getParsedURL: function () {
            return encodeURIComponent(this.getAppBaseURL() + '/j_spring_cas_security_check')
        }
    },
    default: {
        SERVER_URL: "localhost:",
        APP_PORT: process.env.PORT || 8000,
        MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB',
        getAppBaseURL: function () {
            return 'http://' + this.SERVER_URL + this.APP_PORT
        },
        getParsedURL: function () {
            return encodeURIComponent(this.getAppBaseURL() + '/j_spring_cas_security_check')
        }
    },
    heroku: {
        SERVER_URL: "app-cai.herokuapp.com",
        APP_PORT: process.env.PORT,
        MONGO_URI: process.env.MONGODB_URI,
        getAppBaseURL: function () {
            return 'http://' + this.SERVER_URL
        },
        getParsedURL: function () {
            return encodeURIComponent(this.getAppBaseURL() + '/j_spring_cas_security_check')
        }
    }
}

export function checkEnvList(): boolean {
    return ENV_LIST.reduce((acc, val) => {
        return acc && process.env[val] != null;
    }, true);
}

export function getConfig(env): IConfig {
    const confType = env || "default";
    const c = conf[confType];
    if (c) {
        logger(LOG_TYPE.INFO, "USING CONFIGURATION: " + confType);
        return c;
    } else {
        throw new Error("CONFIGURATION ERROR ON CONFIGURATION: " + confType);
    }
}
export const ENV = dotenv.config();
export const config = getConfig(process.env.NODE_ENV);
