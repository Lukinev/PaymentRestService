const express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    checkJWT = require('../../auth'),
    models = require('./models/models_account'),
    libs = require('./libs/functions');

router.post('/account/byId', function (req, res) {
    checkJWT(req.body).then(r => {// if check token
        if (r.status === 200) {
            if (req.body.account && typeof (req.body.account) === 'number') {
                libs.execQuery(models.accountById, [req.body.account], res, global.pool_account);
            } else
                res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        } else
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    })
});

module.exports = router;
