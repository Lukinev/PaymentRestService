const
    moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_payment'),
    model_account = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions'),
    dateTime = require('node-datetime');
    

router.get('/payment/', (req, res) => {
    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS') });
});

//Для выполнения платежа пакетом
router.post('/payment/create_pack', async (req, res) => {
    var st = await checkJWT(req.body);

    if (st.status==200) {
        //Проверяем правильность UID
        const chk = await libs.checkUID(req.body.uid) ;
        if (chk==false){
            res.status(400).json({ "status": 400, "error": "Error find UID "+req.body.uid, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }else{
            //Сначала получем номер пакета
            var payments = req.body.payments;
            for(var i=0; i<payments.length; i++) {
                    //Тут пытаемся создать платеж
                    //проверим корректность суммы платежа
                    const am = await libs.checkAmount(payments[i].amount);
                    if (am==false){
                        res.status(400).json({ "status": 400, "error": "Error sum pay: "+payments[i].amount, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                    }else{
                    //Проверяем правильность ls поставщика

                    //
                    }
                    
                    console.log(payments[i]);
            }
            //res.status(200).json({ "status": 400, "error": "Error sum pay: "+payments[i], "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": payments});

        }
    }else{
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    }
    
});

router.post('/payment/create', async (req, res) => {
    var st= await checkJWT(req.body);
    var pay_id_bank = 0;
//    console.log(st.status);
    if (st.status==200) 
    {
        // if (req.body.package_id ===&& typeof (req.body.client_id) === 'number') {
        //const r = await libs.execQuery(models.paymentNewPackage, [req.body.terminal_id, req.body.service_id, req.body.amount], global.pool_payment);
        //var u = await (libs.execQuery(model_account.accountCheckUID,[req.body.uid], global.pool_account));
                //var cnt = u.rows[0].count;
                if ((await libs.checkUID(req.body.uid))==false){
                    res.status(400).json({ "status": 400, "error": "Error uid", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                }else if (req.body.amount<=0){
                    //  Тут проверим ammount необходимо что бы число было больше нуля
                    res.status(400).json({ "status": 400, "error": "Error sum to pay:"+req.body.amount, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                    //  Тут проверим ammount необходимо что бы число было больше нуля
                }else if (typeof req.body.amount != "number"){ 
                    res.status(400).json({ "status": 400, "error": "Error sum to pay:"+req.body.amount, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
                }
                else
                {
                    if (Boolean(req.body.pay_id_bank)){
                        pay_id_bank=req.body.pay_id_bank;
                    }
                //  Тут проверим ammount необходимо что бы число было больше нуля
                    var uid = req.body.uid;
                    const r = await libs.execQuery(models.paymentNewPay,[
                    uid,                 
                    req.body.amount, 
                    req.body.service_id, 
                    req.body.provider_id, 
                    req.body.createpay, 
                    req.body.client_id,
                    pay_id_bank,
                    ], global.pool_payment);
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows});
                }
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    
});

router.post('/payment/byId', async (req, res) => {
    var st= await checkJWT(req.body);
    if (st.status==200) 
    { 
       const pay = await libs.execQuery(models.paymentById, [req.body.payment_id, req.body.client_id], global.pool_payment);
       if (Boolean(pay.rows[0])){

        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": pay.rows });
       }else{
        res.status(400).json({ "status": 400, "error": "Not find pay", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
       }
    }else{
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
   }
});

router.post('/payment/getPayIdBank', async (req, res) => {
    var st= await checkJWT(req.body);
    if (st.status==200) 
    { 
       const pay = await libs.execQuery(models.paymentGetPayIdBank, [req.body.pay_id_bank, req.body.client_id], global.pool_payment);
       if (Boolean(pay.rows[0])){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": pay.rows });
       }else{
        res.status(400).json({ "status": 400, "error": "Not find pay", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
       }
    }else{
            res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
   }
});

router.post('/payment/setStorno', async (req,res)=>{
    var st = await checkJWT(req.body);
    if (st.status==200) {
        var dt = dateTime.create();
        dt.format('Y-m-d');

        //Проверяем наличие платежа
        const pay = await libs.execQuery(models.paymentById, [req.body.payment_id, req.body.client_id], global.pool_payment);
        if (pay.rows[0].id>0){        
            
            //Сравнить дату платежа и ткущую дату время, текущая дата не должна быть больше даты платежа
            dt_pay = new Date(pay.rows[0].created_at);
            dt_storno = new Date(dt.now());
            delta=dt_storno.getTime()-dt_pay.getTime();
            dt_rang = Math.floor(delta/1000/60/60/24);
            if (dt_rang==0){
                //надо проверить, если сторно в этом платеже
                const check_storno = await libs.execQuery(models.paymentCheckStorno,[req.body.payment_id], global.pool_payment);
                if (check_storno.rows[0].count==0){
                    //Тогда можем делать сторно
                    const r = await libs.execQuery(models.paymentNewStorno,[dt_storno, pay.rows[0].amount, 0, req.body.payment_id],global.pool_payment);
                    //в колонку storno_id текущего платежа вставим значение 
                    const s = await libs.execQuery(models.paymentSetStornoPay,[r.rows[0].id,req.body.payment_id],global.pool_payment);

                    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
                    
                }else{
                    res.status(400).json({ "status": 400, "error": "Storno from pay already exists!", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

                }
            }else{
                res.status(400).json({ "status": 400, "error": "data pay is old!", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
            }

        }else{
            res.status(400).json({ "status": 400, "error": "Not find payment_id", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }
        
    } else
    res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

module.exports = router;
