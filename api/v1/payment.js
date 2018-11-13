const express = require('express'),
    moment = require('moment'),
    router = express.Router(),
    checkJWT = require('../../auth'),
    models = require('./models/models_payment'),
    libs = require('./libs/functions');

router.post('/payment/create', function (req, res) {
    checkJWT(req.body).then(r => {
        if (r.status === 200) {
            if (req.body.terminal_id && typeof (req.body.terminal_id) === 'number') {
                libs.insertQuery(models.paymentNewPackage, [req.body.terminal_id, 10.0], global.pool_payment).then(r => {
                    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r });
                });
            } else
                res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        } else
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    })
});
router.post('/payment/byid', function (req, res) {
    checkJWT(req.body).then(r => {
        if (r.status === 200) {
            if (req.body.payment_id && typeof (req.body.payment_id) === 'number') {
                libs.insertQuery(models.paymentById, [req.body.payment_id], global.pool_payment).then(r => {
                    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r });
                });
            } else
                res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        } else
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    })
});

module.exports = router;
