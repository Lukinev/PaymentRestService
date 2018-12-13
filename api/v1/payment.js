const
    moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_payment'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');

router.get('/payment/', (req, res) => {
    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS') });
});

router.post('/payment/create', async (req, res) => {

            if (req.body.terminal_id && typeof (req.body.terminal_id) === 'number') {
                const r = await libs.execQuery(models.paymentNewPackage, [req.body.terminal_id, req.body.service_id, req.body.amount], global.pool_payment);
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
            } else
                res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

router.post('/payment/byid', async (req, res) => {
    //chech for valid token
        if (req.body.payment_id && typeof (req.body.payment_id) === 'number') {
            const r = await libs.execQuery(models.paymentById, [req.body.payment_id], global.pool_payment);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        } else
            res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

module.exports = router;
