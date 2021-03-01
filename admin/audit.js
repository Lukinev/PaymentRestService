Router = require('express-promise-router'),
router = new Router(),
jwt = require('jsonwebtoken'),
async = require('async'),
request = require('request'),
conf = require('../config'),
nameRoute = '/audit/';


router.all(nameRoute, async(req, res)=>{
  res.send('<h1>Wrong route admin audit</h1>');
  res.status(200).json({"status":200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'),
    "data":{"OK"}
  }):
})

module.exports = router;