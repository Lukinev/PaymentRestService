const
  bodyParser = require('body-parser'),
  cluster = require('cluster'),
  compression = require('compression'),

  fs = require('fs'),
  https = require('https'),
  http = require('http'),
  express = require('express'),
  app = express(),
  app_admin = express();
  //const { Pool } = require('pg');
  const conf = require('./config'),

  api_router = require('./api/api.js');
  api_admin_router = require('./admin/index.js');

  var cookieParser = require('cookie-parser');
  var cors = require('cors');
  const { Certificate } = require('crypto');
  dotenv = require('dotenv').config();;

//option for use HTTPS
/** 
  create Certificate
    openssl genrsa -out key.pem
    openssl req -new -key key.pem -out csr.pem
    openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
    rm csr.pem
  or 
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
 */
const https_options = {
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
  passphrase: conf.password_crt, // optional
  requestCert: false,
  rejectUnauthorized: false,
};

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
    console.log(`worker %d died (%s). restarting...`,
      worker.process.pid, signal || code);
    cluster.fork();
  });
}else {
  //Создаем отдельный канал для админки
  app_admin.use(cors());
  app_admin.use(bodyParser.json());
  app_admin.use(bodyParser.urlencoded({ extended: true }));
  app_admin.use(compression());
  app_admin.use(compression());
  app_admin.use(compression());
  app_admin.use('/api/admin/', api_admin_router);
  /////////////////////////////////////////////
  //Customer chanel
  app.use(cors());
  app.use(bodyParser.json());
  app.use(cookieParser())
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(compression());
  app.use('/api/' + conf.version + '/', api_router);
  //Используем шаблонизатор из папки views
  app.set('view engine', 'ejs'); 


  let httpsServer = https.createServer(https_options, app);
  httpsServer.listen(conf.api_port_ssl);  
  console.log(`Worker ${process.pid} customer started port: `+conf.api_port_ssl);

  //В процессе отладки делаю 2 порта, один без сертификата, для простоты
  let httpServer = http.createServer(app_admin);
  httpServer.listen(conf.api_port); 
  console.log(`Worker ${process.pid} admin started port: `+conf.api_port);
}
