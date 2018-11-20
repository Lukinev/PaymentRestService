const
    moment = require('moment'),
    Router = require('express-promise-router'),
    
    models = require('./models/models_payment'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');
router = new Router(),     
/*
     * sn - серийный номер
     * power
     * flow
     * temp1
     * temp2
     * it_heatmeter 
     */

router.post('/heatmeter/setParams', async (req, res) => {
    if ((await checkJWT(req.body)).status === 200) {
        
        if (req.body.sn && typeof (req.body.sn) === 'number') {
            const r = await libs.execQuery(models.paymentNewPackage, [req.body.terminal_id, 10.0], global.pool_payment);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        } else
            res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

/*
 * 
 router.post('/payment/byid', async (req, res) => {
    //chech for valid token
    if ((await checkJWT(req.body)).status === 200) {
        if (req.body.payment_id && typeof (req.body.payment_id) === 'number') {
            const r = await libs.execQuery(models.paymentById, [req.body.payment_id], global.pool_payment);
            res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
        } else
            res.status(400).json({ "status": 400, "error": "Bad request", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});
*/

module.exports = router;
