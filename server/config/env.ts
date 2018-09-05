interface IConfig {
    SERVER_URL: string,
    APP_PORT: number,
    MONGO_URI: string,
    APP_BASE_URL: string,
    PARSED_URL: string
}

const conf = {
    production: {
        SERVER_URL: "localhost:",
        APP_PORT: process.env.PORT || 8000,
        MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB'
    },
    default: {
        SERVER_URL: "localhost:",
        APP_PORT: process.env.PORT || 8000,
        MONGO_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/CaiDB'
    },
    heroku: {
        SERVER_URL: "app-cai.herokuapp.com",
        APP_PORT: process.env.PORT,
        MONGO_URI: process.env.MONGODB_URI
    }
}

export function getConfig(env): IConfig {
    const c = conf[env] || conf.default;
    c.APP_BASE_URL = 'http://' + c.SERVER_URL + c.APP_PORT;
    c.PARSED_URL = encodeURIComponent(c.APP_BASE_URL + '/j_spring_cas_security_check');
    return c;
}
export const config = getConfig(process.env.NODE_ENV);
