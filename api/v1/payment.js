const
    moment = require('moment'),
    Router = require('express-promise-router'),
    router = new Router(),
    models = require('./models/models_payment'),
    model_account = require('./models/models_account'),
    { checkJWT } = require('./libs/auth'),
    libs = require('./libs/functions'),
    dateTime = require('node-datetime');
    var request = require('request');
    var rp = require('request-promise');
    

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
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": st.status });
    }
    
});

//router.post('/payment/counter')

router.post('/payment/create', async (req, res) => {
    var st= await checkJWT(req.body);
    var pay_id_bank = 0;
    //console.log(req.body);
    if (st.status==200) 
    {
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
                    var uid = req.body.uid;
                    const r = await libs.execQuery(models.paymentNewPay,[
                    uid,                 
                    req.body.amount, 
                    req.body.service_id, 
                    req.body.provider_id, 
                    req.body.createpay, 
                    req.body.client_id,
                    pay_id_bank
                    ], global.pool_payment);
                console.log("Create payment uid="+uid+" pay_id_bank="+pay_id_bank);

                await selectNotSendTGO();
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows});
                }
    } else
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "token": st.status });
    
});

router.post('/payment/byId', async (req, res) => {
    var st= await checkJWT(req.body);
    if (st.status==200) 
    { 
       const pay = await libs.execQuery(models.paymentById, [req.body.payment_id, req.body.client_id], global.pool_payment);
       if (Boolean(pay.rows[0])){
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": pay.rows });
        await selectNotSendTGO();

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
           // if (dt_rang==0){
                //надо проверить, если сторно в этом платеже
                const check_storno = await libs.execQuery(models.paymentCheckStorno,[req.body.payment_id], global.pool_payment);
                if (check_storno.rows[0].count==0){
                    //Тогда можем делать сторно
                    const r = await libs.execQuery(models.paymentNewStorno,[dt_storno, pay.rows[0].amount, 0, req.body.payment_id],global.pool_payment);
                    //в колонку storno_id текущего платежа вставим значение 
                    const s = await libs.execQuery(models.paymentSetStornoPay,[r.rows[0].id,req.body.payment_id],global.pool_payment);

                    res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": r.rows });
                    
                //}else{
                    //res.status(400).json({ "status": 400, "error": "Storno from pay already exists!", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });

                //}
            }else{
                res.status(400).json({ "status": 400, "error": "data pay is old!", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
            }

        }else{
            res.status(400).json({ "status": 400, "error": "Not find payment_id", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
        }
        
    } else
    res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
});

router.post('/payment/setPayIdBank', async(req,res)=>{
    var st= await checkJWT(req.body);
    if (st.status==200) 
    { 
        const pay = await libs.execQuery(models.paymentSetBankID, [req.body.payment_id ,req.body.pay_id_bank, req.body.client_id ], global.pool_payment);
        console.log(pay.rows[0]);
       if (Boolean(pay.rows[0])){
        console.log("fix pay "+req.body.payment_id+", client"+req.body.client_id+", id_bank:"+req.body.pay_id_bank);
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": pay.rows });
       }else{
        res.status(400).json({ "status": 400, "error": "Not find pay", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
       }
    }else{
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "token": st.status });
   }
})


router.post('/payment/delPayTGO', async(req,res)=>{
    var st= await checkJWT(req.body);
    if (st.status==200) 
    { 
//        const pay = await libs.execQuery(models.paymentGetPayTGO, [req.body.payment_id, req.body.client_id ], global.pool_payment);
        const pay = await libs.execQuery(models.paymentGetPayTGO, [req.body.payment_id ], global.pool_payment);

       if (Boolean(pay.rows[0])){
            if ((pay.rows[0].pay_id_tgo)>0){
                //console.log(pay.rows[0].pay_id_tgo);
                var d = await deletePayTGO(req.body.payment_id, pay.rows[0].pay_id_tgo);
                res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "deleted": req.body.payment_id});
            }
       }else{
        res.status(400).json({ "status": 400, "error": "Not find pay", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
       }
    }else{
        res.status(400).json({ "status": 400, "error": "Bad autorized token", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "token": st.status });
   }
})

/**Функция созданна исключительно для банка easypay для подверждения принятого платежа
 */
router.post('/payment/setPayIdEasy', async(req,res)=>{
        /*
        {order_id - ваш ордерИД из,
            payment_id - наш номер транзакции,
            merchant_id -  номер вашего сервиса в нашей системе 

            "action":"payment",
            "merchant_id":5310,
            "order_id":682,
            "version":"v3.0",
            "date":"2018-05-15T16:38:13.3840522+03:00",
            "details":{
            "amount":1.00,
            "desc":"test ",
            "payment_id":123456,
            "recurrent_id":null
        }
        }
        */ 
        //console.log(parseInt(req.body.order_id, 10));

        const client_id=5;
        let pay_id_bank=req.body.details.payment_id;
        let payment_id=parseInt(req.body.order_id, 10);

        const pay = await libs.execQuery(models.paymentSetBankID, [payment_id ,pay_id_bank, client_id], global.pool_payment);
        //console.log(pay.rows[0]);
       if (Boolean(pay.rows[0])){
        console.log("fix pay payment_id="+payment_id+", pay_id_bank="+pay_id_bank+", client_id="+client_id);
        let a = await selectNotSendTGO();
        res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": pay.rows });
       }else{
        res.status(400).json({ "status": 400, "error": "Not find pay", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
       }
})


router.post('/payment/sendNotFixPay', async(req,res)=>{
    //await selectNotSendTGO();
    //console.log("manual run selectNotSendTGO");
    //res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "FIX": "OK" });
    
})
//Выбор записей не переданных в ТГО
async function selectNotSendTGO() {
    //Выбираем все записе не отправленные в биллинг
    const res = await libs.execQuery(models.paymentGetNotSendPay,[],global.pool_payment);
    if ((res.rowCount>0)){
        for (var i = 0; i < res.rows.length; i++) {
            
            await sendPayTGO(
                    res.rows[i].id, 
                    res.rows[i].uid,
                    res.rows[i].pay_id_bank,
                    res.rows[i].amount, 
                    res.rows[i].createdat,
                    res.rows[i].client_id,
                    res.rows[i].provider_id 
                    );            
        console.log("selectNotSendTGO "+res.rows[i].id);

        }
    }
    else{
        console.log("notfind unregistered pay");
    }    
}

router.post('/payment/getPayTGO', async(req,res)=>{
    //uid = libs.getUid(req.body.account, req.body.id_p);
    let account=req.body.account;
    if (Boolean(account)){
       let list=await getPayTGO(account);

       res.status(200).json({ "status": 200, "error": null, "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": list });
    }else{
        res.status(400).json({ "status": 400, "error": "Not find account", "timestamp": moment().format('DD.MM.YYYY hh:mm:ss.SSS'), "dataset": null });
    }
    
    
})

async function getPayTGO(account){
    var options = {
        method: 'GET',
        uri: 'http://85.238.97.144:3000/webload/'+account+'.0000000000.3'
    };

    let list=await rp(options).then(async function (body, result) {
            var r = await JSON.parse(body)
            //console.log(result);
            var row= await r['message'][0];
            console.log(row[row.length-1]);
            console.log(row.length);
            return row;
    })
    .catch(function (err) {
        //console.err(err);
        return;
    });

    return list;
    //await console.log(list);
        
}


async function deletePayTGO(payment_id, pay_id_tgo){
    var options = {
        method: 'POST',
        //24100043
        //24100041
        //1 удалилось, 0 - уже удалено, -1 платеж не найден
        /*function heat.API_BANK_LOAD_TEST.PAY_DELETE (
        m_PAY_ID IN NUMBER
        )  RETURN NUMBER;
        */
        uri: 'http://85.238.97.144:3000/webload/delPay',
        body: {
            "pay_id_tgo":pay_id_tgo
        },

        json: true // Automatically stringifies the body to JSON
    };
        await rp(options)
        .then(async function (body, result) {
            if (body.pay_tgo===1){
            await fixPayTGO(payment_id, -99);
                result = body.pay_tgo;
                console.log('deleted pay_tgo: '+body.pay_tgo);
                return result;
            }else
            {
                console.log(" pay_id="+payment_id+" not del pay_id_tgo="+pay_id_tgo+", error="+body.pay_tgo);
            }
        })
        .catch(function (err) {
            //console.err(err);
            return;
        });        
}

//Отправка одной записи записи в ТГО
async function sendPayTGO(payid, uid, payidbank, amount, dt, client_id, provider_id ) {
    //Получить идентификатор банка ТГО
    const b = await libs.execQuery(models.paymentGetBankTGO,[client_id], global.pool_account);
    //console.log(b.rows[0].test);
    //получить account из uid
    let acc = await libs.getAccount(uid ,provider_id);//await libs.execQuery(model_account.accountGetACCOUNT_ORG,[uid,provider_id],global.pool_account);
    
    //Узнаем находится ли клиент в тесте
    var test = 1;
    var src = 0;
    var tgo=0;


    if (Boolean(b.rows[0])){
        test = b.rows[0].test;
        src = b.rows[0].source_id;
        tgo=b.rows[0].id_tgo;
    }else{
        console.log("Error getBankTGO: "+b.rows);
    }
        
    pay_bank_id = payidbank.toString();
    var options = {
        method: 'POST',
        uri: 'http://85.238.97.144:3000/webload/addPay',
        body: {
            "payid":payid,
            "account": acc,
            "payidbank":pay_bank_id,
            "amount":amount,
            "dt": moment(dt).format('DD.MM.YYYY'),
            "notes":"--",
            "bankid":tgo,
            "sources":src
        },
        json: true // Automatically stringifies the body to JSON
    };

    if (test==0){ 
        await rp(options)
        .then(async function (body) {
            var r = await fixPayTGO(payid, body.pay_tgo);
            console.log("sendPayTGO: "+acc);
        })
        .catch(function (err) {
            console.log(err);
            return;
        });
        
    }else{
        //console.log("TEST BANK NOD LOAD FROM BILLING");
        const er = await fixPayTGO(payid, -99);
        console.log("Error register pay - bankid: "+tgo+" sources:"+src);
    }    
};

async function fixPayTGO(payid, pay_id_tgo) {
    const p = await libs.execQuery(models.paymentSetPayTGO, [payid, pay_id_tgo], global.pool_payment); 
    //console.log(p.rows);  
}


module.exports = router;
