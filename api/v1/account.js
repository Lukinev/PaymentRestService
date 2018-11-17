const moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');

router.post('/account/byId', async (req, res) => {
    if ((await checkJWT(req.body)).status === 200) {
        if (req.body.account && typeof (req.body.account) === 'number') {
            const r = await libs.execQuery(models.accountById, [req.body.account], global.pool_account);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        } else
            res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

module.exports = router;
