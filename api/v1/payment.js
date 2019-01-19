const
    moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_payment'),
    model_account = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions');

router.get('/payment/', (req, res) => {
    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS') });
});

router.post('/payment/create', async (req, res) => {
    var st= await checkJWT(req.body);
//    console.log(st.status);
    if (st.status==200) 
    {
        // if (req.body.package_id ===&& typeof (req.body.client_id) === 'number') {
        //const r = await libs.execQuery(models.paymentNewPackage, [req.body.terminal_id, req.body.service_id, req.body.amount], global.pool_payment);
        //Проверяем правильность UID

        var u = await (libs.execQuery(model_account.accountCheckUID,[req.body.uid], global.pool_account));
                var cnt = u.rows[0].count;
                if (cnt!=1){
                    res.status(400).json({ "status": 400, "error": "Error uid", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                }else if (req.body.amount<=0){
                    res.status(400).json({ "status": 400, "error": "Error sum to pay:"+req.body.amount, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                }else if (typeof req.body.amount != "number"){ 
                }else
                {
                //  Тут проверим ammount необходимо что бы число было больше нуля
                    var uid = req.body.uid;
                    const r = await libs.execQuery(models.paymentNewPay,[
                    uid,                 
                    req.body.amount, 
                    req.body.service_id, 
                    req.body.provider_id, 
                    req.body.createpay, 
                    req.body.client_id
                    ], global.pool_payment);
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows});
                }
           
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    
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
