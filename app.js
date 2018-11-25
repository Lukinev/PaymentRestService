const
  conf = require('./config'),
  bodyParser = require('body-parser'),
  cluster = require('cluster'),
  { Pool, types } = require('pg');

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey = fs.readFileSync('sslcert/ca.key');
var certificate = fs.readFileSync('sslcert/ca.crt');
var express = require('express'), app = express() ,api_router = require('./api/api.js');
 

types.setTypeParser(1700, 'text', parseFloat);
types.setTypeParser(20, 'text', parseInt);

var credentials = {key: privateKey, cert: certificate}; 

global.pool_account = new Pool(conf.pg_pool_conn_param_accounts);
global.pool_payment = new Pool(conf.pg_pool_conn_param_payments);
global.pool_heatmeter = new Pool(conf.pg_pool_conn_param_heatmeter);

let numCPUs = require('os').cpus().length;

// if in config set CPUs number then used it. Else if in config set CPUs number === 0, then used CPUs number of server 
if (conf.coreNum > 0) {
  numCPUs = conf.coreNum;
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  //app.use(compression());
  app.use('/api/' + conf.version + '/', api_router);

  app.get('/', function (req, res) {
    res.send('<h1>Wrong route</h1>');
  });
  app.get('/api', function (req, res) {
    res.send('<h1>Wrong route</h1>');
  });

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


//  app.listen(conf.api_port);
httpServer.listen(conf.api_port);
httpsServer.listen(conf.api_port_ssl);

  console.log(`Worker ${process.pid} started`);
}