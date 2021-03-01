var express = require('express');
var router = express.Router();
var conf = require('../config');

router.all('/', require('./' + conf.version + '/index'));
router.all('/account/*', require('./' + conf.version + '/account'));

module.exports = router;
