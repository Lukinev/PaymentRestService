const
  bodyParser = require('body-parser'),
  cluster = require('cluster'),
  compression = require('compression'),
  { Pool, types } = require('pg'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  express = require('express'),
  app = express(),
  conf = require('./config'),
  api_router = require('./api/api.js');
  var cors = require('cors');

// use to correct convert to float & bigint from postgresql
types.setTypeParser(1700, 'text', parseFloat);
types.setTypeParser(20, 'text', parseInt);

// option for use HTTPS
const https_options = {
    key: fs.readFileSync("./cert/server.key"),
    cert: fs.readFileSync("./cert/server.crt"),
    ca: fs.readFileSync("./cert/ca.crt"),
  requestCert: true,
  rejectUnauthorized: true
};

// pools of connections to DB 
global.pool_account = new Pool(conf.pg_pool_conn_param_accounts);
global.pool_payment = new Pool(conf.pg_pool_conn_param_payments);
global.pool_heatmeter = new Pool(conf.pg_pool_conn_param_heatmeter);

let numCPUs = require('os').cpus().length;

// if in config set CPUs number then used it. Else if in config set CPUs number === 0, then used CPUs number of server 
if (conf.coreNum > 0) {
  numCPUs = conf.coreNum;
}

if (cluster.isMaster) {

  console.log('Master ${process.pid} is running');

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker %d died (%s). restarting...',
      worker.process.pid, signal || code);
    cluster.fork();
  });
}
else {
  app.set('jwt_secret', conf.jwt_secret); // set secret variable
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());
  app.use('/api/' + conf.version + '/', api_router);

  app.get('/', function (req, res) {
    res.send('<h1>Wrong route</h1>');
  });

  app.get('/api', function (req, res) {
    res.send('<h1>Wrong route</h1>');
  });

var httpServer = http.createServer(app);
var httpsServer = https.createServer(https_options, app);


  httpServer.listen(conf.api_port);
  httpsServer.listen(conf.api_port_ssl);

  console.log('Worker ${process.pid} started');
}