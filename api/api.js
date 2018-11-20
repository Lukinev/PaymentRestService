var express = require('express');
var router = express.Router();
var conf = require('../config');

router.all('/', require('./' + conf.version + '/index'));
router.all('/account/*', require('./' + conf.version + '/account'));
router.all('/payment/*', require('./' + conf.version + '/payment'));
router.all('/heatmeter/*', require('./' + conf.version + '/heatmeter'));

module.exports = router;
