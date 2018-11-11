const conf = {
    version: 'v1',
    api_port: 3000,
    coreNum: 0,
    jwt_params: {// options for JWT authorization
        jwt_secret: 'kbv)yfhbq',
        jwt_option: {
            alg: "HS512",
            typ: "JWT"
        }
    },
    pg_conn_param: {
        user: 'postgres',
        host: 'localhost',
        database: 'newdb',
        password: 'qazwsx',
        port: 5432
    },
    pg_pool_conn_param: {
        user: 'postgres',
        host: 'localhost',
        database: 'newdb',
        password: 'qazwsx',
        port: 5432,
        max: 20,
        idleTimeoutMillis: 30000,// number of milliseconds a client must sit idle in the pool and not be checked out
        // before it is disconnected from the backend and discarded
        // default is 10000 (10 seconds) - set to 0 to disable auto-disc 
    }
}

module.exports = conf;