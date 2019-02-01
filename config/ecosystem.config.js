module.exports = {
    apps: [{
        name: "rifugi_cai",
        script: "./out-tsc/server/server.js",
        env: {
            NODE_ENV: "default",
        },
        env_production: {
            NODE_ENV: "production",
        },
        output: './output.log',
        error: './error.log',
        merge_logs: true,
        log_date_format: "DD-MM-YYYY",
        kill_timeout: 1600
    }]
}